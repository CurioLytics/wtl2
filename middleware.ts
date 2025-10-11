import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Skip auth checks for static assets and API routes that handle their own auth
const SKIP_AUTH_PATHS = [
  '/_next/', 
  '/images/', 
  '/icons/', 
  '.svg', 
  '.png', 
  '.jpg', 
  '.jpeg',
  '.ico',
  '.js',
  '.css',
  '.json',
  '.woff',
  '.woff2',
  '.ttf',
  'favicon'
];

// Add cache control to reduce repeated auth checks
const SESSION_CACHE_TIME = 60; // seconds
const sessionCache = new Map<string, {session: any, timestamp: number}>();
const profileCache = new Map<string, {profile: any, timestamp: number}>();

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  
  // Skip auth for static assets to reduce unnecessary auth requests
  const path = request.nextUrl.pathname;
  if (SKIP_AUTH_PATHS.some(skipPath => path.includes(skipPath))) {
    return res;
  }
  
  // Public paths that don't require authentication
  if (path.startsWith('/auth') || path === '/') {
    return res;
  }

  // Create Supabase client only once per request
  const supabase = createMiddlewareClient({ req: request, res });
  
  // Try to get session from cache first
  const cacheKey = request.cookies.toString(); // Use cookies as cache key
  const now = Math.floor(Date.now() / 1000);
  const cachedData = sessionCache.get(cacheKey);
  
  let session;
  if (cachedData && now - cachedData.timestamp < SESSION_CACHE_TIME) {
    session = cachedData.session;
    console.log('Using cached session');
  } else {
    // Get fresh session
    const { data } = await supabase.auth.getSession();
    session = data.session;
    
    // Cache the result
    if (session) {
      sessionCache.set(cacheKey, { 
        session, 
        timestamp: now 
      });
      
      // Cleanup old cache entries (simple approach)
      if (sessionCache.size > 100) {
        const oldestKey = Array.from(sessionCache.keys())[0];
        sessionCache.delete(oldestKey);
      }
    }
  }

  // Protected routes require authentication
  if (!session) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // Only check onboarding status for protected routes (excluding the onboarding page itself and API routes)
  if (!path.startsWith('/onboarding') && !path.startsWith('/api')) {
    try {
      let profile;
      const profileCacheKey = session.user.id;
      const cachedProfile = profileCache.get(profileCacheKey);
      
      if (cachedProfile && now - cachedProfile.timestamp < SESSION_CACHE_TIME) {
        profile = cachedProfile.profile;
        console.log('Using cached profile');
      } else {
        // Fetch profile from database
        const { data, error } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .single();
        
        if (error) {
          console.error('Error checking onboarding status:', error);
          return res;
        }
        
        profile = data;
        
        // Cache the profile
        profileCache.set(profileCacheKey, {
          profile,
          timestamp: now
        });
        
        // Cleanup old cache entries
        if (profileCache.size > 100) {
          const oldestKey = Array.from(profileCache.keys())[0];
          profileCache.delete(oldestKey);
        }
      }

      if (!profile?.onboarding_completed) {
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }
    } catch (err) {
      console.error('Exception in middleware:', err);
      return res;
    }
  }

  return res;
}

// Improved matcher pattern to more specifically exclude files that don't need auth checks
export const config = {
  matcher: [
    // Match all paths except...
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|json)).*)',
  ],
};