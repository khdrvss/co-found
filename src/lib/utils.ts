import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper to generate consistent cool avatars
export function getAvatarUrl(seed: string): string {
  // Using a more creative style "notionists" or "open-peeps" or "bottts-neutral"
  // dicebear styles: avataaars, bottts, bottts-neutral, fun-emoji, icons, identicon, lorelei, lorelei-neutral, micah, miniavs, notionists, open-peeps, personas, pixel-art, shapes, thumbs

  // 'avataaars' is classic developer-like. 'personas' is also good. 'pixel-art' for retro vibe.
  // The user asked for "developers stuff", not letters. 
  // "avataaars" is very popular in tech.
  // "bottts" is robots (could be cool for tech too).
  // Let's go with "avataaars" or "personas" as they look more like people/devs. 
  
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
    seed
  )}&backgroundColor=b6e3f4,c0aede,d1d4f9&backgroundType=gradientLinear`;
}
