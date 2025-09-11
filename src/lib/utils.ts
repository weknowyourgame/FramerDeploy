import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper function to validate Framer website URLs
export function isValidFramerUrl(url: string): boolean {
  // Basic validation for Framer website URLs
  return url.includes('.framer.') || url.endsWith('.framer.website');
}
