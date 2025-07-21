import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatModelName(modelName: string): string {
  if (!modelName) return "";
  return modelName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}
