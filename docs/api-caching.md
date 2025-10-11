# API Caching Implementation

This document explains the caching strategy implemented to optimize API calls and improve performance, especially for repeated requests.

## Problem

The application was making repeated API calls to the same endpoints when navigating between pages or when components remounted, leading to:

1. Unnecessary network traffic
2. Slower user experience
3. Potential rate limiting issues with external APIs
4. Repeated loading states causing UI flickering

## Solution

We implemented a multi-level caching strategy:

1. **Component-level Cache**: For the PinnedTemplates component
2. **Generalized Caching Hook**: `useCachedFetch` for any data fetching need
3. **localStorage Persistence**: Cache persists across page refreshes

## Implementation Details

### 1. PinnedTemplates Component Cache

The `PinnedTemplates` component now implements:

- In-memory cache via module-level variable
- localStorage persistence for cache
- Cache invalidation based on configurable duration (default: 5 minutes)
- Manual refresh option for developers and users
- Debug panel showing cache status

```tsx
// Cache implementation in pinned-templates.tsx
type TemplateCache = {
  templates: PinnedTemplate[];
  timestamp: number;
  userId: string;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let templateCache: TemplateCache | null = null;
```

### 2. Generalized Caching Hook

The `useCachedFetch` hook provides:

- Generic typing for any data type
- Configurable cache duration
- Dependency-based refresh (similar to useEffect dependencies)
- Automatic fallback for error cases
- Manual refresh and cache clearing methods

```typescript
// Example usage
const {
  data: templates,
  loading,
  error,
  refresh,
  clearCache
} = useCachedFetch<PinnedTemplate[]>({
  key: 'pinned-templates',
  duration: 5 * 60 * 1000, // 5 minutes
  dependencyArray: [user?.id],
  fetcher: async () => await fetchPinnedTemplates(user.id),
  fallback: fallbackTemplates
});
```

### 3. API Request Optimization

The API calls now include:

- Cache control headers to avoid intermediary caching
- Request IDs for idempotency
- Error handling with fallbacks
- Proper type definitions for API responses

## Usage Guidelines

### When to Use Caching

1. For data that doesn't change frequently
2. For expensive API calls
3. For data that's used across multiple components
4. For data that should persist across navigation

### When to Invalidate Cache

1. After successful write operations that modify the cached data
2. When user explicitly requests fresh data (via refresh button)
3. After user authentication status changes
4. After a configurable time period (automatic expiration)

### How to Implement in New Components

1. For simple cases, use the `useCachedFetch` hook
2. For complex cases, adapt the pattern from `PinnedTemplates`
3. Always provide fallback data for error cases
4. Consider the cache key naming to avoid conflicts

## Performance Improvements

This caching strategy provides:

1. Faster page loads after initial fetch
2. Reduced network traffic
3. Better offline experience
4. Smoother UI without repeated loading states
5. Reduced server load

## Future Improvements

1. Service worker integration for offline support
2. Cache invalidation webhooks for real-time updates
3. Shared cache across tabs using `localStorage` events
4. Background refresh with stale-while-revalidate pattern