/**
 * Array manipulation utilities
 * Common array operations used across the application
 */

/**
 * Remove duplicates from an array
 */
export function unique<T>(array: T[]): T[] {
    return Array.from(new Set(array));
}

/**
 * Remove duplicates from an array of objects based on a key
 */
export function uniqueBy<T>(array: T[], key: keyof T): T[] {
    const seen = new Set();
    return array.filter(item => {
        const value = item[key];
        if (seen.has(value)) {
            return false;
        }
        seen.add(value);
        return true;
    });
}

/**
 * Group array items by a key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((result, item) => {
        const groupKey = String(item[key]);
        if (!result[groupKey]) {
            result[groupKey] = [];
        }
        result[groupKey].push(item);
        return result;
    }, {} as Record<string, T[]>);
}

/**
 * Sort array of objects by a key
 */
export function sortBy<T>(
    array: T[],
    key: keyof T,
    order: 'asc' | 'desc' = 'asc'
): T[] {
    return [...array].sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];

        if (aVal < bVal) {
            return order === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
            return order === 'asc' ? 1 : -1;
        }
        return 0;
    });
}

/**
 * Chunk array into smaller arrays of specified size
 */
export function chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

/**
 * Shuffle array randomly
 */
export function shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Get random item from array
 */
export function randomItem<T>(array: T[]): T | undefined {
    if (array.length === 0) {
        return undefined;
    }
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Get random items from array
 */
export function randomItems<T>(array: T[], count: number): T[] {
    const shuffled = shuffle(array);
    return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * Move item in array from one index to another
 */
export function moveItem<T>(array: T[], fromIndex: number, toIndex: number): T[] {
    const result = [...array];
    const [removed] = result.splice(fromIndex, 1);
    result.splice(toIndex, 0, removed);
    return result;
}

/**
 * Toggle item in array (add if not present, remove if present)
 */
export function toggleItem<T>(array: T[], item: T): T[] {
    const index = array.indexOf(item);
    if (index === -1) {
        return [...array, item];
    }
    return array.filter((_, i) => i !== index);
}

/**
 * Remove item from array by value
 */
export function removeItem<T>(array: T[], item: T): T[] {
    return array.filter(i => i !== item);
}

/**
 * Remove items from array by predicate
 */
export function removeWhere<T>(array: T[], predicate: (item: T) => boolean): T[] {
    return array.filter(item => !predicate(item));
}

/**
 * Check if arrays are equal (shallow comparison)
 */
export function arraysEqual<T>(arr1: T[], arr2: T[]): boolean {
    if (arr1.length !== arr2.length) {
        return false;
    }
    return arr1.every((item, index) => item === arr2[index]);
}

/**
 * Get intersection of two arrays
 */
export function intersection<T>(arr1: T[], arr2: T[]): T[] {
    return arr1.filter(item => arr2.includes(item));
}

/**
 * Get difference between two arrays (items in arr1 but not in arr2)
 */
export function difference<T>(arr1: T[], arr2: T[]): T[] {
    return arr1.filter(item => !arr2.includes(item));
}

/**
 * Get union of two arrays (all unique items from both)
 */
export function union<T>(arr1: T[], arr2: T[]): T[] {
    return unique([...arr1, ...arr2]);
}

/**
 * Partition array into two arrays based on predicate
 */
export function partition<T>(
    array: T[],
    predicate: (item: T) => boolean
): [T[], T[]] {
    const pass: T[] = [];
    const fail: T[] = [];
    array.forEach(item => {
        if (predicate(item)) {
            pass.push(item);
        } else {
            fail.push(item);
        }
    });
    return [pass, fail];
}

/**
 * Find last item in array matching predicate
 */
export function findLast<T>(
    array: T[],
    predicate: (item: T) => boolean
): T | undefined {
    for (let i = array.length - 1; i >= 0; i--) {
        if (predicate(array[i])) {
            return array[i];
        }
    }
    return undefined;
}

/**
 * Count occurrences of items in array
 */
export function countBy<T>(array: T[], key: keyof T): Record<string, number> {
    return array.reduce((result, item) => {
        const groupKey = String(item[key]);
        result[groupKey] = (result[groupKey] || 0) + 1;
        return result;
    }, {} as Record<string, number>);
}

/**
 * Check if array is empty
 */
export function isEmpty<T>(array: T[]): boolean {
    return array.length === 0;
}

/**
 * Get first item in array
 */
export function first<T>(array: T[]): T | undefined {
    return array[0];
}

/**
 * Get last item in array
 */
export function last<T>(array: T[]): T | undefined {
    return array[array.length - 1];
}
