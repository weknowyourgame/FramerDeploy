"use client";

import { useMemo, useState } from "react";
import { Logo } from "./svgs";
import UrlInput from "./url-input";
import { toast } from "sonner";

export default function Hero() {
  const year = useMemo(() => new Date().getFullYear(), []);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const handleSubmit = async (url: string) => {
    setIsDownloading(true);
    
    try {
      toast.info('Processing your download request...', { 
        duration: 8000,
        description: 'Your download will start automatically when ready.'
      });
      // Note: We don't need to make an API call here anymore
      // The UrlInput component now handles the download directly
    } catch (error) {
      console.error('Error downloading website:', error);
      toast.error(`Failed to download: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-10">
      <div className="flex flex-col items-center justify-center gap-6 mb-2">
        <Logo />
        <div className="flex items-center gap-4 rounded-full border border-border px-4 py-1 relative">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-400" />
          </span>
          <p className="uppercase text-sm font-medium">
            100% Off 🎉 | Premium Plan Coming Soon!
          </p>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-4 max-w-2xl">
        <h2 className="sm:text-5xl text-4xl font-bold text-foreground text-center">
          Export no‑code sites instantly
        </h2>
        <p className="text-base text-muted-foreground text-center max-w-md">
          Paste any supported no‑code site URL and get HTML files instantly. Deploy anywhere with a few clicks.
        </p>
      </div>
      
      <div className="w-full max-w-xl px-4">
        <UrlInput onSubmit={handleSubmit} />
      </div>
      
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-lime-400"></span>
          <span>Easy to use</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-lime-400"></span>
          <span>No coding required</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-lime-400"></span>
          <span>Deployment coming soon</span>
        </div>
      </div>
    </div>
  );
}
