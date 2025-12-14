/**
 * Date formatting utilities
 * Centralizes all date formatting logic for consistency across the app
 */

/**
 * Format a date as a relative time string (e.g., "2 hours ago", "3 days ago")
 * 
 * @param date - The date to format
 * @returns Formatted relative time string
 */
export function formatRelativeTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return 'just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
        return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
        return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
    }

    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`;
}

/**
 * Format a date as a short date string (e.g., "Dec 12, 2024")
 * 
 * @param date - The date to format
 * @returns Formatted date string
 */
export function formatShortDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

/**
 * Format a date as a long date string (e.g., "December 12, 2024")
 * 
 * @param date - The date to format
 * @returns Formatted date string
 */
export function formatLongDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

/**
 * Format a date with time (e.g., "Dec 12, 2024 at 3:45 PM")
 * 
 * @param date - The date to format
 * @returns Formatted date and time string
 */
export function formatDateTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const dateStr = formatShortDate(dateObj);
    const timeStr = dateObj.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
    return `${dateStr} at ${timeStr}`;
}

/**
 * Format a date as ISO string for API calls
 * 
 * @param date - The date to format
 * @returns ISO formatted date string
 */
export function formatISODate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString();
}

/**
 * Check if a date is today
 * 
 * @param date - The date to check
 * @returns True if the date is today
 */
export function isToday(date: Date | string): boolean {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    return (
        dateObj.getDate() === today.getDate() &&
        dateObj.getMonth() === today.getMonth() &&
        dateObj.getFullYear() === today.getFullYear()
    );
}

/**
 * Check if a date is yesterday
 * 
 * @param date - The date to check
 * @returns True if the date is yesterday
 */
export function isYesterday(date: Date | string): boolean {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return (
        dateObj.getDate() === yesterday.getDate() &&
        dateObj.getMonth() === yesterday.getMonth() &&
        dateObj.getFullYear() === yesterday.getFullYear()
    );
}

/**
 * Get a friendly date label (e.g., "Today", "Yesterday", or formatted date)
 * 
 * @param date - The date to format
 * @returns Friendly date label
 */
export function getFriendlyDateLabel(date: Date | string): string {
    if (isToday(date)) {
        return 'Today';
    }
    if (isYesterday(date)) {
        return 'Yesterday';
    }
    return formatShortDate(date);
}
