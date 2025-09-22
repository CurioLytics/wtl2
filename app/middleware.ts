import { NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  try {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Handle authentication redirects
    if (!session) {
      // Allow access to auth pages when not logged in
      if (req.nextUrl.pathname.startsWith('/auth')) {
        return res;
      }
      // Redirect to login for all other pages
      return NextResponse.redirect(new URL('/auth', req.url));
    }

    // User is logged in
    if (req.nextUrl.pathname.startsWith('/auth')) {
      // Redirect logged in users away from auth pages
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Check for onboarding completion if not on onboarding page
    if (!req.nextUrl.pathname.startsWith('/onboarding')) {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .single();
        
        if (error) {
          console.error('Error checking onboarding status:', error);
          // Continue to the requested page if there's an error
          return res;
        }

        if (!profile?.onboarding_completed) {
          return NextResponse.redirect(new URL('/onboarding', req.url));
        }
      } catch (err) {
        console.error('Exception in middleware:', err);
        // Continue to the requested page if there's an exception
        return res;
      }
    }

    return res;
  } catch (e) {
    // In case of any errors, redirect to auth page
    return NextResponse.redirect(new URL('/auth', req.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|icons).*)',
  ],
};