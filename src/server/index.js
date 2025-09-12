import express from 'express';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import cors from 'cors';
import archiver from 'archiver';
import { deletePrefixFromR2, normalizeUrlRemoveWww, uploadFolderToR2 } from './utils.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(express.json());
// Enable CORS for all routes with specific options
app.use(cors({
  origin: ['http://localhost:3000', 'https://exportnocode.com', '*'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'x-api-key'],
  credentials: true
}));

// Auth middleware
app.use(async (req, res, next) => {
  const token = req.headers['x-api-key'];
  if (token !== process.env.SECRET_TOKEN) {
    return res.status(401).json({ detail: "Unauthorized" });
  }
  next();
});

// ================================
// Health check - support both paths
// ================================
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: "healthy",
    service: "Website Mirror API",
    version: "1.0.0"
  });
});

// ================================
// Mirror a website - support both API paths
// ================================
app.post(['/api/mirror', '/mirror'], async (req, res) => {
  try {
    const { url, max_depth = 2, wait_time = 2.0 } = req.body;

    if (!url) return res.status(400).json({ detail: "URL is required" });
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return res.status(400).json({ detail: "Invalid URL format. Must start with http:// or https://" });
    }

    const normalizedUrl = normalizeUrlRemoveWww(url);
    const config = { url: normalizedUrl, max_depth, wait_time, user_agent: "Mozilla/5.0 (compatible; FastAPI-Mirror)" };

    // Determine a folder name for this mirror
    const hostname = new URL(normalizedUrl).hostname;
    const mirrorsDir = path.join(process.cwd(), 'mirrors');
    
    // Create mirrors directory if it doesn't exist
    if (!fs.existsSync(mirrorsDir)) {
      fs.mkdirSync(mirrorsDir, { recursive: true });
    }
    
    const outputDir = path.join(mirrorsDir, hostname);
  
    // Ensure folder exists
    // If local directory exists from a previous run, remove it to replace with fresh mirror
    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true, force: true });
    }
    fs.mkdirSync(outputDir, { recursive: true });

    const wgetCmd = [
        'wget',
        '--mirror',
        '--convert-links',
        '--adjust-extension',
        '--page-requisites',
        '--no-parent',
        '--no-host-directories',
        '--no-verbose',
        `--wait=${wait_time}`,
        `--level=${max_depth}`,
        `--directory-prefix=${outputDir}`,
        `--user-agent="Mozilla/5.0 (compatible; FastAPI-Mirror)"`,
        normalizedUrl
      ].join(' ');

    console.log(`Running mirror for: ${normalizedUrl}`);
    console.log(wgetCmd);

    // Run wget command for max 30 secs
    const timeout = setTimeout(() => {
      console.error('wget command timed out');
      return res.status(500).json({ detail: 'wget command timed out' });
    }, 30000);

    console.log("Executing wget command...");
    // Check if wget is available
    exec('which wget', (whichErr) => {
      if (whichErr) {
        console.error('wget command not found. Please install wget.');
        clearTimeout(timeout);
        return res.status(500).json({ detail: "wget command not found. Server configuration error." });
      }
      
      // If wget is available, run the command
      exec(wgetCmd, async (err, stdout, stderr) => {
      if (err) {
        console.error(stderr);
        return res.status(500).json({ detail: `Mirror operation failed: ${err.message}` });
      }
      clearTimeout(timeout);
      console.log(stdout);
      
      // Create a zip file of the mirrored content
      const timestamp = Date.now();
      const zipFileName = `${hostname}-${timestamp}.zip`;
      const zipFilePath = path.join(mirrorsDir, zipFileName);
      
      try {
        // Create zip file
        const output = fs.createWriteStream(zipFilePath);
        const archive = archiver('zip', { zlib: { level: 9 } });
        
        // Listen for errors
        archive.on('error', (err) => {
          throw err;
        });
        
        // Pipe archive data to the output file
        archive.pipe(output);
        
        // Add files from the directory to the archive
        archive.directory(outputDir, false);
        
        // Finalize the archive
        await archive.finalize();
        
        // Wait for the output stream to finish
        await new Promise((resolve) => {
          output.on('close', resolve);
        });
        
        console.log(`Zip archive created: ${zipFilePath}`);
        
        // Try to upload to R2, but don't block the download if it fails
        try {
          // Remove any existing objects for this hostname in R2, then upload fresh copy
          console.log("Attempting to upload to R2 storage...");
          await deletePrefixFromR2(hostname);
          // Upload to R2
          await uploadFolderToR2(outputDir, hostname);
          console.log("R2 upload completed successfully");
        } catch (r2Error) {
          // Log the error but continue with the download
          console.error("R2 storage error (download will still work):", r2Error);
        }
        
        // Send the zip file directly as a download
        res.download(zipFilePath, zipFileName, (err) => {
          if (err) {
            console.error(`Error sending zip file: ${err}`);
          }
          
          // Clean up zip file after download completes or fails
          setTimeout(() => {
            if (fs.existsSync(zipFilePath)) {
              fs.unlinkSync(zipFilePath);
              console.log(`Deleted zip file: ${zipFilePath}`);
            }
          }, 60000); // Delete after 1 minute
        });
      } catch (error) {
        console.error(`Error creating zip file: ${error}`);
        // Clean up if zip creation fails
        if (fs.existsSync(zipFilePath)) {
          fs.unlinkSync(zipFilePath);
        }
        
        res.status(500).json({
          status: "error",
          message: `Failed to create zip file: ${error.message}`,
          url: normalizedUrl
        });
      }
    });
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: `Mirror operation failed: ${error.message}` });
  }
});

// Start the server if not being imported
if (import.meta.url === `file://${process.argv[1]}`) {
  // Always use port 3001 for development to match Next.js API route expectations
  const PORT = 3001;
  try {
    app.listen(PORT, () => {
      console.log(`Express server running on port ${PORT}`);
      console.log(`Test the API by visiting: http://localhost:${PORT}/api/health`);
      console.log(`SECRET_TOKEN set: ${process.env.SECRET_TOKEN ? 'Yes' : 'No'}`);
      console.log(`R2 config available: ${process.env.R2_ENDPOINT ? 'Yes' : 'No'}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Export the Express app as default export for Vercel
export default app;
