import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function highlightText(text, query) {
  if (!query) return text
  const regex = new RegExp(`(${query})`, "gi")
  return text.replace(regex, "<mark class='bg-yellow-200 text-black'>$1</mark>")
}
