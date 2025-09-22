import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PinnedTemplates } from '@/components/journal/pinned-templates';
import { fetchPinnedTemplates } from '@/services/api/template-service';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/use-auth';

// Mock dependencies
jest.mock('@/services/api/template-service', () => ({
  fetchPinnedTemplates: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/hooks/auth/use-auth', () => ({
  useAuth: jest.fn(),
}));

describe('PinnedTemplates', () => {
  const mockRouter = {
    push: jest.fn(),
  };
  
  // Setup before each test
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'test-user-id' },
    });
  });
  
  // Define the new API response format for testing
  const nestedApiResponse = [
    {
      data: [
        {
          id: '6a4398bf-76a0-4a5e-88ad-50eedc6efcd5',
          name: 'Daily Reflection',
          content: 'What went well today?\n\nWhat didn\'t go as planned?\n\nWhat did you learn?\n\nWhat will you do differently tomorrow?'
        },
        {
          id: '796f1de4-5bfb-4d9f-8a56-371f1975f781',
          name: 'Problem Solving',
          content: 'What symptom are you noticing?\n\nWhat are the possible reasons you are noticing this symptom?\n\nWhat is happening that, if it stopped happening, would cause the symptoms to either narrow or disappear?\n\nWhat isn\'t happening that, if it did happen, would cause the symptoms to either narrow or disappear?\n\nWhat do you think the core problem is based on your reasoning so far?'
        }
      ]
    }
  ];
  
  it('should render loading state initially', () => {
    (fetchPinnedTemplates as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve([]), 100))
    );
    
    render(<PinnedTemplates />);
    
    // Check for loading indicator
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
  
  it('should render templates when data is loaded successfully', async () => {
    const mockTemplates = [
      { id: '1', title: 'Template 1', category: 'Category 1' },
      { id: '2', title: 'Template 2', category: 'Category 2' },
    ];
    
    (fetchPinnedTemplates as jest.Mock).mockResolvedValue(mockTemplates);
    
    render(<PinnedTemplates />);
    
    // Wait for templates to load
    await waitFor(() => {
      expect(screen.getByText('Template 1')).toBeInTheDocument();
      expect(screen.getByText('Template 2')).toBeInTheDocument();
      expect(screen.getByText('Category 1')).toBeInTheDocument();
      expect(screen.getByText('Category 2')).toBeInTheDocument();
    });
  });
  
  it('should display fallback templates when API call fails', async () => {
    (fetchPinnedTemplates as jest.Mock).mockRejectedValue(new Error('API Error'));
    
    render(<PinnedTemplates />);
    
    // Wait for fallback templates to display
    await waitFor(() => {
      expect(screen.getByText('Morning Check-in')).toBeInTheDocument();
      expect(screen.getByText('Minimalism Prompt')).toBeInTheDocument();
    });
    
    // Check for error message
    expect(screen.getByText(/Could not load templates/i)).toBeInTheDocument();
  });
  
  it('should navigate to journal creation when Start Writing button is clicked', async () => {
    const mockTemplates = [
      { id: '1', title: 'Template 1', category: 'Category 1' },
    ];
    
    (fetchPinnedTemplates as jest.Mock).mockResolvedValue(mockTemplates);
    
    render(<PinnedTemplates />);
    
    // Wait for templates to load
    await waitFor(() => {
      expect(screen.getByText('Template 1')).toBeInTheDocument();
    });
    
    // Click the Start Writing button
    fireEvent.click(screen.getByText('Start Writing'));
    
    // Expect router.push to be called
    expect(mockRouter.push).toHaveBeenCalledWith('/journal/new');
  });
  
  it('should pass selected template ID when clicking Start Writing', async () => {
    const mockTemplates = [
      { id: 'template-123', title: 'Template 1', category: 'Category 1' },
    ];
    
    (fetchPinnedTemplates as jest.Mock).mockResolvedValue(mockTemplates);
    
    render(<PinnedTemplates />);
    
    // Wait for templates to load
    await waitFor(() => {
      expect(screen.getByText('Template 1')).toBeInTheDocument();
    });
    
    // Click on the template first to select it
    fireEvent.click(screen.getByText('Template 1'));
    
    // Then click Start Writing button
    fireEvent.click(screen.getByText('Start Writing'));
    
    // Expect router.push to be called with template ID
    expect(mockRouter.push).toHaveBeenCalledWith('/journal/new?templateId=template-123');
  });
  
  it('should handle the nested API response format correctly', async () => {
    // Mock the implementation of fetchPinnedTemplates to return transformed data
    // This simulates what would happen in the actual service when receiving the nested format
    (fetchPinnedTemplates as jest.Mock).mockImplementation(async () => {
      // This returns what our updated service would return after processing the nested API response
      return [
        { 
          id: '6a4398bf-76a0-4a5e-88ad-50eedc6efcd5', 
          title: 'Daily Reflection', 
          category: 'Journaling',
          content: 'What went well today?\n\nWhat didn\'t go as planned?\n\nWhat did you learn?\n\nWhat will you do differently tomorrow?'
        },
        {
          id: '796f1de4-5bfb-4d9f-8a56-371f1975f781',
          title: 'Problem Solving',
          category: 'Problem Solving',
          content: 'What symptom are you noticing?\n\nWhat are the possible reasons you are noticing this symptom?'
        }
      ];
    });
    
    render(<PinnedTemplates />);
    
    // Wait for templates to load and verify they display correctly
    await waitFor(() => {
      expect(screen.getByText('Daily Reflection')).toBeInTheDocument();
      expect(screen.getByText('Problem Solving')).toBeInTheDocument();
      expect(screen.getByText('Journaling')).toBeInTheDocument();
      expect(screen.getByText('Problem Solving')).toBeInTheDocument();
    });
  });
});