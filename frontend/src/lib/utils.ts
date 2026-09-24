import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with conflict resolution.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a timestamp into a human-readable "time ago" string.
 */
export function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 5) return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;

  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

/**
 * Get or create a persistent anonymous user ID.
 */
export function getOrCreateUserId(): string {
  if (typeof window === "undefined") return "";
  const key = "idea-board-user-id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

/**
 * Get or set the user's display name from localStorage.
 */
export function getDisplayName(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("idea-board-display-name") || "";
}

export function setDisplayName(name: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("idea-board-display-name", name);
}

/**
 * Format presence user list into a readable string.
 * e.g., "Alice, Bob, and 3 others are viewing"
 */
export function formatPresenceText(
  names: string[],
  totalCount: number
): string {
  if (totalCount === 0) return "No one else is here yet";
  if (totalCount === 1) return `${names[0] || "1 person"} is viewing`;

  const named = names.filter(Boolean).slice(0, 2);
  const othersCount = totalCount - named.length;

  if (named.length === 0) {
    return `${totalCount} people are viewing`;
  }

  if (othersCount === 0) {
    return `${named.join(" and ")} are viewing`;
  }

  if (othersCount === 1) {
    return `${named.join(", ")} and 1 other are viewing`;
  }

  return `${named.join(", ")} and ${othersCount} others are viewing`;
}
