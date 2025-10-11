import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Mock the modules
vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

// We need to import after mocking
let GET: (request: NextRequest) => Promise<NextResponse>;

describe('Auth Callback Route Handler', () => {
  const mockSupabase = {
    auth: {
      getSession: vi.fn(),
      exchangeCodeForSession: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(),
      })),
    })),
  };
  
  const mockRequest = {
    nextUrl: {
      searchParams: new URLSearchParams(),
      origin: 'http://localhost:3000',
    },
  } as unknown as NextRequest;
  
  beforeEach(async () => {
    vi.resetAllMocks();
    vi.resetModules();
    
    // Setup mocks
    (createRouteHandlerClient as vi.Mock).mockReturnValue(mockSupabase);
    (cookies as unknown as vi.Mock).mockReturnValue({
      getAll: () => [],
    });
    
    // Import module dynamically after mocking
    const routeModule = await import('@/app/auth/callback/route');
    GET = routeModule.GET;
  });
  
  it('handles valid authentication code', async () => {
    // Setup
    const code = 'valid_auth_code';
    mockRequest.nextUrl.searchParams.set('code', code);
    
    // Mock successful exchange and user session
    mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({ 
      data: { session: { user: { id: 'user123', email: 'test@example.com' } } }, 
      error: null 
    });
    
    // Mock profile query (profile doesn't exist)
    mockSupabase.from().select().eq().single.mockResolvedValue({
      data: null,
      error: null
    });
    
    // Mock profile creation
    mockSupabase.from().insert().mockResolvedValue({
      data: [{ id: 'profile123' }],
      error: null
    });
    
    // Mock onboarding check
    mockSupabase.from().select().eq().single.mockResolvedValue({
      data: { onboarding_completed: false },
      error: null
    });
    
    // Execute
    const response = await GET(mockRequest);
    
    // Assertions
    expect(mockSupabase.auth.exchangeCodeForSession).toHaveBeenCalledWith(code);
    expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
    
    // Check redirect URL - should go to onboarding since it's not completed
    expect(response.status).toBe(302); // Redirect status
    const redirectUrl = response.headers.get('location');
    expect(redirectUrl).toContain('/onboarding');
  });
  
  it('redirects to dashboard when onboarding is completed', async () => {
    // Setup
    const code = 'valid_auth_code';
    mockRequest.nextUrl.searchParams.set('code', code);
    
    // Mock successful exchange and user session
    mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({ 
      data: { session: { user: { id: 'user123', email: 'test@example.com' } } }, 
      error: null 
    });
    
    // Mock profile query (profile already exists)
    mockSupabase.from().select().eq().single.mockResolvedValue({
      data: { id: 'profile123', user_id: 'user123' },
      error: null
    });
    
    // Mock onboarding check - completed
    mockSupabase.from().select().eq().single.mockResolvedValue({
      data: { onboarding_completed: true },
      error: null
    });
    
    // Execute
    const response = await GET(mockRequest);
    
    // Assertions
    expect(mockSupabase.auth.exchangeCodeForSession).toHaveBeenCalledWith(code);
    
    // Check redirect URL - should go to dashboard since onboarding is completed
    expect(response.status).toBe(302); // Redirect status
    const redirectUrl = response.headers.get('location');
    expect(redirectUrl).toContain('/dashboard');
  });
  
  it('handles authentication errors', async () => {
    // Setup
    const code = 'invalid_auth_code';
    mockRequest.nextUrl.searchParams.set('code', code);
    
    // Mock failed exchange
    mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
      data: null,
      error: { message: 'Invalid code' }
    });
    
    // Execute
    const response = await GET(mockRequest);
    
    // Assertions
    expect(mockSupabase.auth.exchangeCodeForSession).toHaveBeenCalledWith(code);
    
    // Check redirect URL with error parameter
    expect(response.status).toBe(302); // Redirect status
    const redirectUrl = response.headers.get('location');
    expect(redirectUrl).toContain('/auth');
    expect(redirectUrl).toContain('error=Failed%20to%20complete%20authentication');
  });

  it('handles missing code parameter', async () => {
    // No code in request
    
    // Execute
    const response = await GET(mockRequest);
    
    // Assertions
    expect(mockSupabase.auth.exchangeCodeForSession).not.toHaveBeenCalled();
    
    // Check redirect URL - should go back to auth page
    expect(response.status).toBe(302); // Redirect status
    const redirectUrl = response.headers.get('location');
    expect(redirectUrl).toContain('/auth');
  });
});