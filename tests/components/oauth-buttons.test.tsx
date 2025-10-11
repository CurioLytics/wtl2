import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OAuthButtons } from '@/components/auth/oauth-buttons';
import { signInWithProvider } from '@/services/api/auth-service';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the auth service
vi.mock('@/services/api/auth-service', () => ({
  signInWithProvider: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (param: string) => {
      if (param === 'error') return null;
      if (param === 'provider') return null;
      return null;
    }
  }),
}));

describe('OAuthButtons Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true
    });
  });

  it('renders Google sign-in button correctly', () => {
    render(<OAuthButtons />);
    
    const button = screen.getByText('Continue with Google');
    expect(button).toBeInTheDocument();
    
    // Check for Google icon
    const googleIcon = document.querySelector('img[alt="Google"]');
    expect(googleIcon).toBeInTheDocument();
  });

  it('shows loading state when button is clicked', async () => {
    // Mock the auth service to delay response
    (signInWithProvider as vi.Mock).mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ data: {}, error: null });
        }, 100);
      });
    });
    
    render(<OAuthButtons />);
    
    const button = screen.getByText('Continue with Google');
    fireEvent.click(button);
    
    // Check for loading state
    expect(await screen.findByText('Connecting...')).toBeInTheDocument();
  });

  it('calls signInWithProvider with google provider', async () => {
    (signInWithProvider as vi.Mock).mockResolvedValue({ data: {}, error: null });
    
    render(<OAuthButtons />);
    
    const button = screen.getByText('Continue with Google');
    fireEvent.click(button);
    
    expect(signInWithProvider).toHaveBeenCalledWith('google');
  });

  it('displays error message when authentication fails', async () => {
    const errorMessage = 'Authentication failed';
    (signInWithProvider as vi.Mock).mockResolvedValue({ 
      data: null, 
      error: { message: errorMessage } 
    });
    
    render(<OAuthButtons />);
    
    const button = screen.getByText('Continue with Google');
    fireEvent.click(button);
    
    // Wait for error message to appear
    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
  });

  it('handles error from URL parameters', () => {
    // Override mock for this specific test
    vi.mock('next/navigation', () => ({
      useSearchParams: () => ({
        get: (param: string) => {
          if (param === 'error') return 'Authentication%20failed';
          return null;
        }
      }),
    }), { virtual: true });
    
    render(<OAuthButtons />);
    
    // Check for error message
    const errorMessage = screen.getByText('Authentication failed');
    expect(errorMessage).toBeInTheDocument();
  });
});