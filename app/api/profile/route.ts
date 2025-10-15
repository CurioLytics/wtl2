import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { UserProfile } from '@/types/onboarding';
import { sendWebhook } from '@/utils/webhook';

// Use a simple in-memory cache to prevent duplicate profile updates in a short time period
const PROFILE_UPDATE_CACHE = new Map<string, number>();
const CACHE_TTL = 10000; // 10 seconds

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const profile: Partial<UserProfile> = await request.json();

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    // Nếu không có người dùng đã đăng nhập, chúng ta chỉ trả về thành công
    // nhưng không lưu vào database. Thông tin này sẽ được lưu sau khi đăng ký
    if (userError || !user) {
      return NextResponse.json({ 
        success: true, 
        message: 'Profile data received but not saved - user not authenticated' 
      });
    }

    // Check for recent duplicate requests
    const cacheKey = `${user.id}-${JSON.stringify(profile)}`;
    const lastUpdate = PROFILE_UPDATE_CACHE.get(cacheKey);
    const now = Date.now();
    
    if (lastUpdate && now - lastUpdate < CACHE_TTL) {
      console.log('Duplicate profile update detected, using cached response');
      return NextResponse.json({ 
        success: true,
        profile: {
          userId: user.id,
          email: user.email,
          ...profile,
          onboardingCompleted: true,
        },
        cached: true
      });
    }
    
    // Update cache timestamp
    PROFILE_UPDATE_CACHE.set(cacheKey, now);
    
    // Clean up old cache entries
    if (PROFILE_UPDATE_CACHE.size > 100) {
      const oldestKey = Array.from(PROFILE_UPDATE_CACHE.keys())[0];
      PROFILE_UPDATE_CACHE.delete(oldestKey);
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
    // Add a unique timestamp to help with idempotency
    const timestamp = new Date().toISOString();
    const webhookData = {
      userId: user.id,
      email: user.email,
      ...profile,
      onboardingCompleted: true,
      timestamp,
      requestId: `${user.id}-${timestamp}`  // Add unique request ID
    };

    console.log('Preparing to send webhook with data:', webhookData);
    
    // Send webhook asynchronously to avoid blocking the response
    // This is a good approach for non-critical operations
    let webhookPromise = sendWebhook(webhookData);
    
    // Return success immediately while webhook continues in the background
    return NextResponse.json({ 
      success: true,
      profile: webhookData,
      webhook: 'processing_async' // Don't wait for webhook result
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}