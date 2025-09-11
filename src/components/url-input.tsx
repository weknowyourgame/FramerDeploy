"use client";

import { useState } from "react";
import { Button } from "./ui/button";

interface UrlInputProps {
  onSubmit: (url: string) => void;
}

export default function UrlInput({ onSubmit }: UrlInputProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

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
    
    try {
      onSubmit(url);
      // Actual API call would be handled by the parent component
    } catch (error) {
      setError("An error occurred. Please try again.");
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
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#e5ff00] text-black hover:bg-[#c2d900]"
            >
              {isLoading ? "Processing..." : "Download"}
            </Button>
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
        </div>
      </form>
    </div>
  );
}
