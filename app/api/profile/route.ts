import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { UserProfile } from '@/types/onboarding';
import { sendWebhook } from '@/utils/webhook';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const profile: Partial<UserProfile> = await request.json();

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Attempting to save profile:', profile);
    
    // Update or create the profile
    const { data: savedProfile, error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        name: profile.name,
        english_level: profile.englishLevel,
        goals: profile.goals,
        writing_types: profile.writingTypes,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!savedProfile) {
      console.error('No profile data returned from Supabase');
      return NextResponse.json({ error: 'Failed to save profile' }, { status: 400 });
    }

    // Send webhook with profile data and user ID
    const webhookData = {
      userId: user.id,
      email: user.email,
      ...profile,
      onboardingCompleted: true,
      timestamp: new Date().toISOString(),
    };

    console.log('Preparing to send webhook with data:', webhookData);
    
    let webhookStatus;
    try {
      webhookStatus = await sendWebhook(webhookData);
      console.log('Webhook result:', webhookStatus);
    } catch (webhookError) {
      console.error('Error sending webhook:', webhookError);
      webhookStatus = {
        success: false,
        error: webhookError instanceof Error ? webhookError.message : 'Unknown error'
      };
    }

    return NextResponse.json({ 
      success: true,
      profile: webhookData,
      webhook: webhookStatus
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}