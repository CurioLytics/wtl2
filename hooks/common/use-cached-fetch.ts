import { useEffect, useState } from 'react';

interface CacheConfig<T> {
  key: string; // localStorage key
  duration?: number; // cache duration in milliseconds, default 5 minutes
  dependencyArray?: any[]; // like useEffect dependencies - when to refresh
  fetcher: () => Promise<T>; // async function to fetch data
  fallback?: T; // fallback value if fetch fails
}

/**
 * A custom hook for data fetching with built-in caching to localStorage.
 * This helps prevent repeated API calls when navigating between pages.
 */
export function useCachedFetch<T>({
  key,
  duration = 5 * 60 * 1000, // default 5 minutes
  dependencyArray = [],
  fetcher,
  fallback
}: CacheConfig<T>) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch and cache logic
  const fetchWithCache = async (force = false) => {
    setLoading(true);
    setError(null);
    
    try {
      if (!force && typeof window !== 'undefined') {
        // Try to get from in-memory cache or localStorage
        const cachedData = localStorage.getItem(`cache_${key}`);
        
        if (cachedData) {
          const { data: cachedValue, timestamp } = JSON.parse(cachedData);
          const now = Date.now();
          
          // Check if cache is still valid
          if (now - timestamp < duration) {
            console.log(`Using cached data for ${key}`);
            setData(cachedValue);
            setLoading(false);
            return;
          } else {
            console.log(`Cache expired for ${key}, fetching fresh data`);
            localStorage.removeItem(`cache_${key}`);
          }
        }
      }
      
      // Fetch fresh data
      console.log(`Fetching fresh data for ${key}`);
      const freshData = await fetcher();
      setData(freshData);
      
      // Cache the result
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`cache_${key}`, JSON.stringify({
            data: freshData,
            timestamp: Date.now()
          }));
        } catch (storageErr) {
          console.warn('Failed to cache data to localStorage:', storageErr);
        }
      }
    } catch (err) {
      console.error(`Error fetching ${key}:`, err);
      setError(err as Error);
      
      // Use fallback if provided
      if (fallback !== undefined) {
        setData(fallback);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch based on dependencies
  useEffect(() => {
    fetchWithCache();
  }, [...dependencyArray]); // eslint-disable-line react-hooks/exhaustive-deps

  // Clear cache for this key
  const clearCache = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`cache_${key}`);
    }
    console.log(`Cache cleared for ${key}`);
  };
  
  // Refresh data (force fetch)
  const refresh = () => {
    clearCache();
    return fetchWithCache(true);
  };

  return { data, loading, error, refresh, clearCache };
}

// Utility function to clear all cached data
export function clearAllCaches() {
  if (typeof window !== 'undefined') {
    // Get all localStorage keys
    const keys = Object.keys(localStorage);
    
    // Remove all cache_ prefixed items
    keys.forEach(key => {
      if (key.startsWith('cache_')) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('All caches cleared');
  }
}

export default useCachedFetch;