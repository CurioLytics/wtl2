import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/types/database.types';

type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];

// Helper function to create a profile if one doesn't exist
async function ensureProfileExists(
  supabase: ReturnType<typeof createServerClient<Database>>,
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
      
      // Use type-safe insert with updated database schema
      const profileData: ProfileInsert = {
        id: userId,
        name: null,
        english_level: null,
        daily_review_goal: null,
        english_challenges: null,
        english_improvement_reasons: null,
        journaling_challenges: null,
        journaling_reasons: null,
        onboarding_completed: false,
        updated_at: new Date().toISOString(),
      };

      const { error: insertError } = await supabase
        .from('profiles')
        .insert(profileData as any);

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
    const cookieStore = await cookies();
    
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {
              // Handle error silently - cookies may be set in middleware
            }
          },
        },
      }
    );
    
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const error_description = searchParams.get('error_description');
    const provider = searchParams.get('provider') || 'unknown';
    const type = searchParams.get('type'); // Check if this is a password reset

    // Handle error from OAuth provider
    if (error) {
      console.error(`${provider} OAuth error:`, error, error_description);
      return NextResponse.redirect(
        new URL(`/auth?error=${encodeURIComponent(error_description || 'Authentication failed')}&provider=${provider}`, req.url)
      );
    }

    // Handle password reset callback
    if (type === 'recovery') {
      if (code) {
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          console.error('Password reset session exchange error:', exchangeError);
          return NextResponse.redirect(
            new URL(`/auth/reset-password?error=${encodeURIComponent('Invalid reset link')}`, req.url)
          );
        }
        // Redirect to reset password page with the session
        return NextResponse.redirect(new URL('/auth/reset-password', req.url));
      } else {
        return NextResponse.redirect(
          new URL(`/auth/reset-password?error=${encodeURIComponent('Invalid reset link')}`, req.url)
        );
      }
    }

    // Exchange code for session
    if (code) {
      console.log('Exchanging code for session');
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        console.error('Session exchange error:', exchangeError);
        console.error('Error details:', JSON.stringify(exchangeError, null, 2));
        return NextResponse.redirect(
          new URL(`/auth?error=${encodeURIComponent(exchangeError.message || 'Failed to complete authentication')}&provider=${provider}`, req.url)
        );
      }
      
      // Use the session from the exchange to avoid an extra auth call
      const user = data?.session?.user;
      
      if (user) {
        console.log(`User authenticated: ${user.id}`);
        
        // Auto-verify test emails (emails starting with 'test')
        if (user.email && user.email.toLowerCase().startsWith('test') && !user.email_confirmed_at) {
          console.log('Auto-verifying test email:', user.email);
          // Note: Supabase doesn't allow direct email verification via client,
          // but the email_confirm flag in signup should handle this
        }
        
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
        
        // Redirect based on onboarding status (with type assertion due to helper lib issues)
        if ((profile as any)?.onboarding_completed) {
          return NextResponse.redirect(new URL('/home', req.url));
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