'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnalyticsSummary } from '@/types/analytics';

interface UseAnalyticsOptions {
  startDate: Date;
  endDate: Date;
  autoFetch?: boolean;
}

interface UseAnalyticsReturn {
  data: AnalyticsSummary | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching analytics data for the Progress page
 */
export function useAnalytics({
  startDate,
  endDate,
  autoFetch = true
}: UseAnalyticsOptions): UseAnalyticsReturn {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get client's timezone offset in minutes (e.g., -420 for UTC+7)
      const timezoneOffset = new Date().getTimezoneOffset();

      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        timezoneOffset: timezoneOffset.toString(),
      });

      console.log('[useAnalytics] Fetching:', params.toString());
      const response = await fetch(`/api/analytics/events?${params}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('[useAnalytics] Response success:', result.success, 'has data:', !!result.data);

      if (result.success && result.data) {
        setData(result.data);
      } else {
        const errorMessage = typeof result.error === 'string'
          ? result.error
          : 'Failed to load analytics data';
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error('[useAnalytics] Error fetching analytics:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    if (autoFetch) {
      fetchAnalytics();
    }
  }, [autoFetch, fetchAnalytics]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchAnalytics,
  };
}
