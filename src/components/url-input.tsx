"use client";

import { useState } from "react";
import { Button } from "./ui/button";

interface UrlInputProps {
  onSubmit?: (url: string) => void;
}

export default function UrlInput({ onSubmit }: UrlInputProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [downloadProgress, setDownloadProgress] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setDownloadProgress(null);

    if (!url.trim()) {
      setError("Please enter a Framer website URL");
      return;
    }

    // Basic URL validation
    if (!url.includes(".framer.") && !url.endsWith(".framer.website")) {
      setError("Please enter a valid Framer website URL");
      return;
    }

    setIsLoading(true);
    setDownloadProgress("Preparing to mirror website...");
    
    try {
      // If parent component provided onSubmit, call it
      if (onSubmit) {
        onSubmit(url);
      }

      // Normalize the URL if needed
      let targetUrl = url;
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'https://' + targetUrl;
      }

      setDownloadProgress("Starting download process...");
      
      // Make API call to external mirror-api
      setDownloadProgress("Contacting download server...");
      const response = await fetch(process.env.NEXT_PUBLIC_MIRROR_API_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: targetUrl,
          max_depth: 2,
          wait_time: 2.0
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to mirror the website');
      }
      
      setDownloadProgress("Processing response...");
      
      // Handle the file download
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      // Get filename from content-disposition header or use default
      const contentDisposition = response.headers.get('content-disposition');
      let filename = 'framer-website-mirror.zip';
      if (contentDisposition) {
        const filenameMatch = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }
      
      // Create a temporary anchor and trigger download
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
      
      setDownloadProgress("Download started!");
      setTimeout(() => setDownloadProgress(null), 3000);
    } catch (error) {
      console.error('Download error:', error);
      setError(error instanceof Error ? error.message : "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="url-input" className="sr-only">
            Enter Framer website URL
          </label>
          <div className="flex sm:flex-row flex-col w-full gap-2">
            <input
              id="url-input"
              type="text"
              placeholder="Enter your .framer website URL (e.g., mysite.framer.website)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#e5ff00] text-black hover:bg-[#c2d900] h-12 w-30"
            >
              {isLoading ? "Processing..." : "Download"}
            </Button>
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          {downloadProgress && (
            <p className="text-sm text-green-600 animate-pulse mt-2">
              {downloadProgress}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
