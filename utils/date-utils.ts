export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

export function timeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';
  
  return Math.floor(seconds) + ' seconds ago';
}

/**
 * Format distance to now in a human-readable format (e.g., "3 days ago")
 * This function is a wrapper around timeAgo for consistent API naming
 * @param date - The date to calculate the distance from
 * @returns A string representing the time distance in a human-readable format
 */
export function formatDistanceToNow(date: Date): string {
  return timeAgo(date);
}

/**
 * Formats a Date object to YYYY-MM-DD format for input[type="date"] fields
 * @param date - The date to format
 * @returns A string in YYYY-MM-DD format
 */
export function formatDateInput(date: Date): string {
  // Format to YYYY-MM-DD which is required for input[type="date"]
  return date.toISOString().split('T')[0];
}

/**
 * Parses a date string from input[type="date"] and returns a Date object
 * @param dateString - The date string in YYYY-MM-DD format
 * @returns A Date object or null if the date is invalid
 */
export function parseDateInput(dateString: string): Date | null {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  // Check if date is valid
  return isNaN(date.getTime()) ? null : date;
}