import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
// Use more generic typing since we're having issues with the Database type
import type { SupabaseClient } from '@supabase/supabase-js';

// Helper function to create a profile if one doesn't exist
async function ensureProfileExists(
  supabase: SupabaseClient,
  userId: string,
  userEmail: string | undefined
) {
  try {
    // Check if profile exists
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error checking for existing profile:', profileError);
      return false;
    }

    // If no profile exists, create one
    if (!existingProfile) {
      console.log(`Creating new profile for user ${userId}`);
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          name: null, // User will set this during onboarding
          english_level: null, // Will be set during onboarding
          goals: null, // Will be set during onboarding
          writing_types: null, // Will be set during onboarding
          onboarding_completed: false,
          updated_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error('Error creating profile:', insertError);
        return false;
      }
      
      console.log('Profile created successfully');
      return true;
    }
    
    return true;
  } catch (error) {
    console.error('Error in ensureProfileExists:', error);
    return false;
  }
}

export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const error_description = searchParams.get('error_description');
    const provider = searchParams.get('provider') || 'unknown';

    // Handle error from OAuth provider
    if (error) {
      console.error(`${provider} OAuth error:`, error, error_description);
      return NextResponse.redirect(
        new URL(`/auth?error=${encodeURIComponent(error_description || 'Authentication failed')}&provider=${provider}`, req.url)
      );
    }

    // Exchange code for session
    if (code) {
      console.log('Exchanging code for session');
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        console.error('Session exchange error:', exchangeError);
        return NextResponse.redirect(
          new URL(`/auth?error=${encodeURIComponent('Failed to complete authentication')}&provider=${provider}`, req.url)
        );
      }
      
      // Use the session from the exchange to avoid an extra auth call
      const user = data?.session?.user;
      
      if (user) {
        console.log(`User authenticated: ${user.id}`);
        
        // Ensure a profile exists for this user
        const profileCreated = await ensureProfileExists(supabase, user.id, user.email);
        
        if (!profileCreated) {
          console.error('Failed to ensure profile exists');
          return NextResponse.redirect(
            new URL(`/auth?error=${encodeURIComponent('Failed to create user profile')}&provider=${provider}`, req.url)
          );
        }
        
        // Now check onboarding status
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          console.error('Error fetching profile:', profileError);
          // If we can't fetch profile, redirect to onboarding to be safe
          return NextResponse.redirect(new URL('/onboarding', req.url));
        }
        
        // Redirect based on onboarding status
        if (profile?.onboarding_completed) {
          return NextResponse.redirect(new URL('/dashboard', req.url));
        } else {
          return NextResponse.redirect(new URL('/onboarding', req.url));
        }
      }
    }

    // Default redirect if no code or error
    return NextResponse.redirect(new URL('/auth', req.url));
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.redirect(new URL('/auth?error=Something+went+wrong', req.url));
  }
}