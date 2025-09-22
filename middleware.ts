import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const path = request.nextUrl.pathname;
  
  // Public paths that don't require authentication
  if (path.startsWith('/auth') || path === '/') {
    return res;
  }

  // Protected routes require authentication
  if (!session) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // Only check onboarding status for protected routes (excluding the onboarding page itself)
  if (!path.startsWith('/onboarding') && !path.startsWith('/api')) {
    try {
      // Use the supabase client properly with RPC call instead of direct REST API call
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', session.user.id)
        .single();
      
      if (error) {
        console.error('Error checking onboarding status:', error);
        // Continue to the requested page even if there's an error checking onboarding
        return res;
      }

      if (!profile?.onboarding_completed) {
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }
    } catch (err) {
      console.error('Exception in middleware:', err);
      // Continue to the requested page if there's an exception
      return res;
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};