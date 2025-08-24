// Utility: merge class names (shadcn-style)
import { type ClassValue } from "clsx";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// color helpers (optional future use)
export const colors = {
  primary: "#0B4AA3",
  accent: "#6C5CE7",
};
