import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper function to validate supported website URLs (Framer first)
export function isValidFramerUrl(url: string): boolean {
  return url.includes('.framer.') || url.endsWith('.framer.website');
}
