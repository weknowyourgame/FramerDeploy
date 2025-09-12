import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

// No authentication required

// Helper function to normalize URL
function normalizeUrlRemoveWww(url: string): string {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.startsWith('www.')) {
      urlObj.hostname = urlObj.hostname.substring(4);
    }
    return urlObj.toString();
  } catch (error) {
    return url;
  }
}

// Health check endpoint
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: "healthy",
    service: "Website Mirror API",
    version: "1.0.0"
  });
}

// Mirror endpoint
export async function POST(request: NextRequest) {

  try {
    const body = await request.json();
    const { url, max_depth = 2, wait_time = 2.0 } = body;

    if (!url) {
      return NextResponse.json({ detail: "URL is required" }, { status: 400 });
    }
    
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return NextResponse.json({ 
        detail: "Invalid URL format. Must start with http:// or https://" 
      }, { status: 400 });
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

    // Run wget command with timeout
    const wgetPromise = new Promise<string>((resolve, reject) => {
      // Check if wget is available first
      exec('which wget', (whichErr) => {
        if (whichErr) {
          reject(new Error('wget command not found. Server configuration error.'));
          return;
        }
        
        // If wget is available, run the command
        exec(wgetCmd, (err, stdout, stderr) => {
          if (err) {
            reject(new Error(`Mirror operation failed: ${err.message}`));
            return;
          }
          console.log(stdout);
          resolve(stdout);
        });
      });
    });

    // Set timeout for the entire operation
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('wget command timed out'));
      }, 30000);
    });

    // Wait for wget to complete
    await Promise.race([wgetPromise, timeoutPromise]);

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
      
      // Read the zip file and return it
      const zipBuffer = fs.readFileSync(zipFilePath);
      
      // Clean up zip file
      fs.unlinkSync(zipFilePath);
      
      // Return the zip file as a download
      return new NextResponse(zipBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="${zipFileName}"`,
        },
      });
      
    } catch (error) {
      console.error(`Error creating zip file: ${error}`);
      // Clean up if zip creation fails
      if (fs.existsSync(zipFilePath)) {
        fs.unlinkSync(zipFilePath);
      }
      
      return NextResponse.json({
        status: "error",
        message: `Failed to create zip file: ${error.message}`,
        url: normalizedUrl
      }, { status: 500 });
    }

  } catch (error) {
    console.error(error);
    return NextResponse.json({ 
      detail: `Mirror operation failed: ${error.message}` 
    }, { status: 500 });
  }
}
