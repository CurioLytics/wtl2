import { createClient } from '@/services/supabase/server';
import { NextResponse } from 'next/server';

/**
 * User preferences structure for webhooks
 */
export interface UserPreferences {
  name: string;
  english_level: string;
  style: string;
}

/**
 * Authenticate user from request and return user object
 * Throws error if user is not authenticated
 */
export async function authenticateUser() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  return user;
}

/**
 * Standard error handler for API routes
 */
export function handleApiError(error: unknown) {
  console.error('API Error:', error);

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { error: 'Internal Server Error' },
    { status: 500 }
  );
}

/**
 * Parse and validate JSON request body
 */
export async function parseRequestBody<T>(request: Request): Promise<T> {
  try {
    return await request.json();
  } catch {
    throw new Error('Invalid JSON in request body');
  }
}

/**
 * Create successful response
 */
export function createSuccessResponse(data: any, message?: string) {
  return NextResponse.json({
    success: true,
    data,
    ...(message && { message })
  });
}

/**
 * Get user preferences (name, english_level, style) from profiles table
 * Returns default values if profile not found or fields are null
 * Default: { name: "User", english_level: "intermediate", style: "conversational" }
 */
export async function getUserPreferences(userId: string): Promise<UserPreferences> {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, english_level, style')
    .eq('id', userId)
    .single();

  return {
    name: profile?.name || 'User',
    english_level: profile?.english_level || 'intermediate',
    style: profile?.style || 'conversational',
  };
}