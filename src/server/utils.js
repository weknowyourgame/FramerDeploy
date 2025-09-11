import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3'; // Cloudflare R2 uses S3 API
import fs from 'fs';
import path from 'path';

// Check if R2 configuration is available
const hasR2Config = process.env.R2_ENDPOINT && 
                   process.env.R2_ACCESS_KEY && 
                   process.env.R2_SECRET_KEY && 
                   process.env.R2_BUCKET;

// Create S3 client only if configuration is available
let s3;
let BUCKET;

if (hasR2Config) {
  try {
    s3 = new S3Client({
      region: "auto",
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY,
        secretAccessKey: process.env.R2_SECRET_KEY
      }
    });
    BUCKET = process.env.R2_BUCKET;
    console.log("R2 storage configured successfully");
  } catch (error) {
    console.error("Failed to initialize R2 client:", error);
    s3 = null;
  }
} else {
  console.log("R2 storage not configured, upload features disabled");
  s3 = null;
}

// helper to delete all objects under a given prefix in R2
async function deletePrefixFromR2(prefix) {
    // Skip if R2 is not configured
    if (!s3 || !BUCKET) {
      console.log("R2 not configured, skipping deletePrefixFromR2");
      return;
    }

    const normalizedPrefix = prefix.endsWith('/') ? prefix : `${prefix}/`;
    let continuationToken = undefined;
    try {
      do {
        let listResp;
        try {
          listResp = await s3.send(new ListObjectsV2Command({
            Bucket: BUCKET,
            Prefix: normalizedPrefix,
            ContinuationToken: continuationToken
          }));
        } catch (err) {
          const code = err?.Code || err?.name;
          const http = err?.$metadata?.httpStatusCode;
          if (code === 'NoSuchKey' || http === 404) {
            // Nothing to delete for this prefix
            return;
          }
          throw err;
        }
    
        continuationToken = listResp.IsTruncated ? listResp.NextContinuationToken : undefined;
    
        const objectsToDelete = (listResp.Contents || []).map(obj => ({ Key: obj.Key }));
        if (objectsToDelete.length > 0) {
          try {
            await s3.send(new DeleteObjectsCommand({
              Bucket: BUCKET,
              Delete: { Objects: objectsToDelete, Quiet: true }
            }));
          } catch (err) {
            const code = err?.Code || err?.name;
            const http = err?.$metadata?.httpStatusCode;
            if (code === 'NoSuchKey' || http === 404) {
              // If some keys don't exist, continue deleting the rest
              continue;
            }
            throw err;
          }
        }
      } while (continuationToken);
    } catch (error) {
      console.error("Error in deletePrefixFromR2:", error);
      // Don't throw - let the app continue without R2 operations
    }
  }
  
// Normalize URL by removing leading www. from hostname
function normalizeUrlRemoveWww(inputUrl) {
    const parsed = new URL(inputUrl);
    const normalizedHost = parsed.hostname.replace(/^www\./, '');
    return `${parsed.protocol}//${normalizedHost}${parsed.pathname}${parsed.search}${parsed.hash}`;
}

// Helper function to upload folder recursively to R2
async function uploadFolderToR2(localDir, remoteDir) {
    // Skip if R2 is not configured
    if (!s3 || !BUCKET) {
      console.log("R2 not configured, skipping uploadFolderToR2");
      return;
    }
    
    try {
      const files = fs.readdirSync(localDir);
      for (const file of files) {
        const localPath = path.join(localDir, file);
        const remotePath = path.posix.join(remoteDir, file);
    
        if (fs.lstatSync(localPath).isDirectory()) {
          await uploadFolderToR2(localPath, remotePath);
        } else {
          try {
            const fileStream = fs.createReadStream(localPath);
            await s3.send(new PutObjectCommand({
              Bucket: BUCKET,
              Key: remotePath,
              Body: fileStream
            }));
          } catch (uploadError) {
            console.error(`Error uploading file ${localPath}:`, uploadError);
            // Continue with other files even if one fails
          }
        }
      }
    } catch (error) {
      console.error("Error in uploadFolderToR2:", error);
      // Don't throw - let the app continue without R2 operations
    }
  }

export {
  deletePrefixFromR2,
  normalizeUrlRemoveWww,
  uploadFolderToR2
};
