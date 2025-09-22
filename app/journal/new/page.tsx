'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/auth/use-auth';
import { JournalTemplate } from '@/types/journal';
import { journalTemplateService } from '@/services/api/journal-template-service';
import { journalFeedbackService } from '@/services/api/journal-feedback-service';
import { generatePlaceholderFeedback } from '@/utils/journal-utils';
import { Button } from '@/components/ui/button';
import { BreathingLoader } from '@/components/ui/breathing-loader';
import { formatDateInput } from '@/utils/date-utils';

// Helper function to determine template type from tags
const getTemplateTypeFromTags = (tags: string[]): string => {
  const tagMapping: Record<string, string> = {
    'daily': 'daily_reflection',
    'reflection': 'daily_reflection',
    'gratitude': 'gratitude',
    'goals': 'goal_oriented',
    'mindfulness': 'mindfulness',
    'meditation': 'mindfulness',
    'habits': 'habit_tracker',
    'tracking': 'habit_tracker',
    'pros-cons': 'pros_cons',
    'decision': 'pros_cons',
  };
  
  for (const tag of tags) {
    const lowercaseTag = tag.toLowerCase();
    // Check if the tag matches any known template types
    for (const [keyword, templateType] of Object.entries(tagMapping)) {
      if (lowercaseTag.includes(keyword)) {
        return templateType;
      }
    }
  }
  
  return 'prompt_based'; // Default template type
};

export default function NewJournalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [template, setTemplate] = useState<JournalTemplate | null>(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [entryDate, setEntryDate] = useState<string>(formatDateInput(new Date())); // Default to today
  const [isEditMode, setIsEditMode] = useState(false);

  const templateId = searchParams?.get('templateId');
  const isEdit = searchParams?.get('edit') === 'true';
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);
  
  // Check for edit mode and load from localStorage if needed
  useEffect(() => {
    if (isEdit) {
      setIsEditMode(true);
      
      // Load content and title from localStorage
      const savedContent = localStorage.getItem('editJournalContent');
      const savedTitle = localStorage.getItem('editJournalTitle');
      
      if (savedContent) {
        setContent(savedContent);
      }
      
      if (savedTitle) {
        setTitle(savedTitle);
      }
      
      // Clear localStorage after loading
      localStorage.removeItem('editJournalContent');
      localStorage.removeItem('editJournalTitle');
    }
  }, [isEdit]);

  // Fetch template if templateId is provided
  useEffect(() => {
    async function loadTemplate() {
      if (!templateId || isEditMode) return; // Skip if in edit mode
      
      try {
        setIsLoading(true);
        const templateData = await journalTemplateService.getTemplateById(templateId);
        setTemplate(templateData);
        
        // Set default title based on template
        const today = new Date();
        setTitle(`${templateData.name} - ${today.toLocaleDateString()}`);
        
        // Use the template content directly from the database
        if (templateData.content) {
          // Populate the textarea with the template content
          setContent(templateData.content);
        } else {
          // Determine template type from tags if content isn't available
          const templateType = getTemplateTypeFromTags(templateData.tag);
          
          // Set default content based on detected template type
          switch (templateType) {
            case 'daily_reflection':
              setContent(`# Daily Reflection\n\n## What went well today?\n\n## What could have gone better?\n\n## What am I grateful for?\n\n## What did I learn?\n`);
              break;
            case 'gratitude':
              setContent(`# Gratitude Journal\n\n## Three things I'm grateful for today:\n\n1. \n2. \n3. \n\n## Why these matter to me:\n\n`);
              break;
            case 'goal_oriented':
              setContent(`# Goals\n\n## Today's goal:\n\n## Steps to achieve it:\n\n## Challenges I might face:\n\n## How I'll overcome them:\n`);
              break;
            case 'mindfulness':
              setContent(`# Mindfulness Check-in\n\n## How am I feeling right now?\n\n## What physical sensations do I notice?\n\n## What thoughts are occupying my mind?\n\n## What can I do to feel more present?\n`);
              break;
            case 'habit_tracker':
              setContent(`# Habit Tracker\n\n## Habits I'm tracking:\n\n- [ ] \n- [ ] \n- [ ] \n\n## Progress notes:\n`);
              break;
            case 'pros_cons':
              setContent(`# Pros and Cons\n\n## Decision I'm considering:\n\n## Pros:\n\n## Cons:\n\n## Thoughts:\n`);
              break;
            default:
              setContent(`# ${templateData.name}\n\n`);
          }
        }
        
      } catch (err) {
        console.error('Error loading template:', err);
        setError('Failed to load the selected template. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadTemplate();
  }, [templateId]);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Send to API
      const response = await fetch('/api/journal-entry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          templateId: template?.id || null,
          entryDate: entryDate || formatDateInput(new Date()), // Use selected date or default to today
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save journal entry');
      }
      
      // Redirect to the journal entry page
      router.push(`/journal/${data.id}`);
      
    } catch (err) {
      console.error('Error saving journal:', err);
      setError('Failed to save your journal entry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGetFeedback = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Basic client-side validation
      if (!content || content.trim() === '') {
        setError('Please write some content before requesting feedback.');
        setIsLoading(false);
        return;
      }
      
      // First save the journal entry
      try {
        const response = await fetch('/api/journal-entry', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            content,
            templateId: template?.id || null,
            entryDate: entryDate || formatDateInput(new Date()),
          }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to save journal entry');
        }
        
        // Note: We continue with feedback rather than redirecting
      } catch (saveErr) {
        console.error('Error saving journal before feedback:', saveErr);
        // We'll continue with feedback but note the save error
      }
      
      // Show user feedback that process has started with breathing animation
      const processingMessage = document.createElement('div');
      processingMessage.className = 'fixed inset-0 bg-black/30 flex items-center justify-center z-50';
      
      // Create the breathing animation container
      const breathingContainer = document.createElement('div');
      breathingContainer.className = 'bg-white rounded-lg shadow-lg p-6 max-w-md w-full flex flex-col items-center';
      
      // Add initial content
      breathingContainer.innerHTML = `
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Analyzing your journal</h3>
        <div class="breathing-bubble relative flex items-center justify-center my-8">
          <div class="rounded-full bg-primary/20 w-24 h-24 transition-all duration-[4000ms] ease-in-out"></div>
          <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <p class="font-medium text-primary">breathe in</p>
          </div>
        </div>
        <p class="text-sm text-gray-500">This helps us provide better feedback</p>
      `;
      
      processingMessage.appendChild(breathingContainer);
      document.body.appendChild(processingMessage);
      
      // Set up the breathing animation
      const bubble = breathingContainer.querySelector('.breathing-bubble > div') as HTMLElement;
      const breathingText = breathingContainer.querySelector('.breathing-bubble p') as HTMLElement;
      let isBreathingIn = true;
      
      // Function to toggle breathing state
      const toggleBreathing = () => {
        isBreathingIn = !isBreathingIn;
        
        if (isBreathingIn) {
          // Breathe in state
          if (bubble) {
            bubble.className = 'rounded-full bg-primary/20 w-24 h-24 transition-all duration-[4000ms] ease-in-out opacity-80';
          }
          if (breathingText) {
            breathingText.textContent = 'breathe in';
          }
        } else {
          // Breathe out state
          if (bubble) {
            bubble.className = 'rounded-full bg-primary/20 w-12 h-12 transition-all duration-[4000ms] ease-in-out opacity-50';
          }
          if (breathingText) {
            breathingText.textContent = 'breathe out';
          }
        }
      };
      
      // Start the breathing animation
      const breathingInterval = setInterval(toggleBreathing, 5000);
      
      // Update message after 20 seconds to indicate it's taking longer than expected
      const longWaitTimeout = setTimeout(() => {
        if (document.body.contains(processingMessage)) {
          const titleElement = breathingContainer.querySelector('h3');
          const messageElement = breathingContainer.querySelector('p');
          
          if (titleElement) {
            titleElement.textContent = 'Still analyzing...';
          }
          if (messageElement) {
            messageElement.textContent = 'This may take up to a minute';
          }
        }
      }, 20000);
      
      // Function to clean up the animation and UI elements
      const cleanupAnimation = () => {
        if (document.body.contains(processingMessage)) {
          document.body.removeChild(processingMessage);
        }
        clearInterval(breathingInterval);
        clearTimeout(longWaitTimeout);
      };
      
      try {
        // Call the feedback webhook
        const feedback = await journalFeedbackService.getFeedback(content, title);
        
        // Clean up animation
        cleanupAnimation();
        
        // Check if feedback is complete or partial
        const isPartialFeedback = !feedback.summary || 
                                  feedback.summary === 'No summary available' ||
                                  !Array.isArray(feedback.vocabSuggestions) || 
                                  feedback.vocabSuggestions.length === 0;
        
        // Encode feedback data for URL (with fallbacks for missing data)
        const safeData = {
          title: feedback.title || title || 'Journal Feedback',
          summary: feedback.summary || 'No summary available',
          improvedVersion: feedback.improvedVersion || content,
          originalVersion: feedback.originalVersion || content, // Include original content
          vocabSuggestions: Array.isArray(feedback.vocabSuggestions) ? feedback.vocabSuggestions : []
        };
        
        const feedbackParam = encodeURIComponent(JSON.stringify(safeData));
        
        // Navigate to feedback page with feedback data and a flag if it's partial
        router.push(`/journal/feedback?feedback=${feedbackParam}${isPartialFeedback ? '&partial=true' : ''}`);
      } catch (err: any) {
        // Clean up animations
        cleanupAnimation();
        
        console.error('Error getting feedback:', err);
        
        // Format a more user-friendly error message
        let userMessage = 'We encountered an issue getting feedback on your journal.';
        let technicalDetails = '';
        let errorType = 'general';
        
        // Try to extract meaningful error information
        if (err instanceof Error) {
          // Network related errors
          if (err.message.includes('Failed to fetch') || 
              err.message.includes('NetworkError') || 
              err.message.includes('network')) {
            userMessage = 'Unable to connect to the feedback service. Please check your internet connection.';
            errorType = 'network';
          } 
          // Timeout related errors
          else if (err.message.includes('timeout') || 
                  err.message.toLowerCase().includes('timed out') || 
                  err.message.includes('504')) {
            userMessage = 'The feedback service is taking too long to respond. Your journal entry might be too long or the service might be experiencing high traffic.';
            errorType = 'timeout';
          } 
          // Server errors
          else if (err.message.includes('500') || 
                  err.message.includes('502') || 
                  err.message.includes('503')) {
            userMessage = 'The feedback service encountered an internal error while processing your journal.';
            errorType = 'server';
          } 
          // Response parsing errors
          else if (err.message.includes('Invalid response') || 
                  err.message.includes('parse') || 
                  err.message.includes('Unexpected response structure')) {
            userMessage = 'We received an invalid response from the feedback service. This might be due to changes in the API structure.';
            errorType = 'parse';
          }
          // Missing data errors
          else if (err.message.includes('incomplete') || 
                  err.message.includes('missing')) {
            userMessage = 'The feedback service returned incomplete data. Some features might be limited.';
            errorType = 'incomplete';
          }
          
          technicalDetails = err.message;
        }
        
        // Show dialog with appropriate message and options based on error type
        const useBasicFeedback = confirm(
          `${userMessage}\n\nWould you like to continue with basic feedback instead?`
        );
        
        if (useBasicFeedback) {
          // Generate fallback feedback 
          const fallbackFeedback = generatePlaceholderFeedback(content, title);
          const feedbackParam = encodeURIComponent(JSON.stringify(fallbackFeedback));
          
          // Navigate with fallback flag and error info
          router.push(`/journal/feedback?feedback=${feedbackParam}&fallback=true&error=${encodeURIComponent(errorType)}`);
        } else {
          // If user doesn't want fallback, show error in the UI
          setError(`${userMessage} (${technicalDetails})`);
          setIsLoading(false);
        }
      }
    } catch (err: any) {
      console.error('Unexpected error in feedback handler:', err);
      
      // Handle truly unexpected errors
      let message = 'An unexpected error occurred while processing your journal.';
      if (err?.message) {
        message += ` Error details: ${err.message}`;
      }
      
      setError(message);
      setIsLoading(false);
    }
  };
  
  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <BreathingLoader message="Creating your journal" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {isEditMode && (
            <div className="mb-4 px-4 py-2 bg-blue-50 text-blue-700 rounded-md text-sm">
              You are editing your journal entry. Make your changes and click "Get Feedback" to save.
            </div>
          )}
          <div className="flex flex-col md:flex-row md:gap-6 mb-6">
            <div className="flex-1 mb-4 md:mb-0">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Journal Title"
              />
            </div>
            <div className="md:w-1/4">
              <label htmlFor="entryDate" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                id="entryDate"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                max={formatDateInput(new Date())} // Prevent future dates
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-h-[400px]"
              placeholder="Start writing..."
            />
          </div>
          
          {error && (
            <div className="text-red-600 text-sm p-4 bg-red-50 rounded-lg mb-4">
              {error}
            </div>
          )}
          
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleGetFeedback}
              disabled={isLoading || !content || !title}
            >
              Get Feedback
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}