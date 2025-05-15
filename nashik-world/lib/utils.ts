import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function checkOnlineStatus() {
  if (!navigator.onLine) {
    throw new Error("You are currently offline. Please check your internet connection.")
  }
}
