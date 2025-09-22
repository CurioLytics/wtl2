'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/auth/use-auth';
import { JournalFeedback } from '@/types/journal';
import { FlashcardWebhookResponseArray } from '@/types/flashcard';
import { Button } from '@/components/ui/button';
import { BreathingLoader } from '@/components/ui/breathing-loader';
import { HighlightSelector } from '@/components/journal/highlight-selector-new';
import { HighlightList } from '@/components/journal/highlight-list';
import styles from '@/components/journal/highlight-selector.module.css';

export default function JournalFeedbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<JournalFeedback | null>(null);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [processingHighlights, setProcessingHighlights] = useState(false);
  
  /**
   * Helper function to save journal and process highlights
   * @param highlightsToProcess - Array of highlights to process (empty for just saving)
   * @param redirectToFlashcards - Whether to redirect to flashcards creation page after saving
   */
  const saveJournalAndHighlights = async (highlightsToProcess: string[], redirectToFlashcards: boolean = false) => {
    try {
      setProcessingHighlights(true);
      setError(null); // Clear any previous errors
      
      if (!user?.id) {
        throw new Error('User ID not available. Please log in again.');
      }
      
      // Prepare the payload with all required fields
      const payload = {
        userId: user.id,
        title: feedback?.title || '',
        content: feedback?.improvedVersion || feedback?.originalVersion || '',
        journalDate: new Date().toISOString().split('T')[0], // Format: YYYY-MM-DD
        highlights: highlightsToProcess
      };
      
      // Send the combined data to the new webhook endpoint
      const response = await fetch('https://auto.zephyrastyle.com/webhook/save-process-highlight', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error((data as any).error || 'Failed to save and process highlights');
      }

      // Handle the response from the webhook
      console.log('Save and process highlights response:', JSON.stringify(data, null, 2));
      
      if (redirectToFlashcards && highlightsToProcess.length > 0) {
        // Store the flashcard data in localStorage for the flashcard creation page
        localStorage.setItem('flashcardData', JSON.stringify(data));
        
        // Redirect to the flashcard creation page with loading animation
        router.push('/flashcards/create');
      } else {
        // Redirect to journals list
        router.push('/journal');
      }
    } catch (err) {
      console.error('Error in saveJournalAndHighlights:', err);
      setError(`Failed to save journal: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setProcessingHighlights(false);
      return false;
    }
    
    return true;
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);
  
  // Get feedback data from search params (passed as JSON)
  useEffect(() => {
    try {
      const feedbackParam = searchParams?.get('feedback');
      const isFallback = searchParams?.get('fallback') === 'true';
      const isPartial = searchParams?.get('partial') === 'true';
      const errorType = searchParams?.get('error');
      
      // If no feedback data, show error
      if (!feedbackParam) {
        setError('No feedback data found. Please go back and try again.');
        setIsLoading(false);
        return;
      }
      
      // Parse the feedback data
      const parsedFeedback: JournalFeedback = JSON.parse(decodeURIComponent(feedbackParam));
      setFeedback(parsedFeedback);
      
      // Check if we have limited data and show appropriate message
      const hasLimitedData = !parsedFeedback.summary || 
                            parsedFeedback.summary === 'No summary available';
      
      // Show appropriate message based on flags
      if (isFallback) {
        // Show specific message based on error type if available
        if (errorType) {
          switch (decodeURIComponent(errorType)) {
            case 'timeout':
              setError('Note: The feedback service took too long to respond. We\'re showing basic feedback instead.');
              break;
            case 'network':
              setError('Note: Unable to reach the feedback service. We\'re showing basic feedback instead.');
              break;
            case 'parse':
            case 'server':
              setError('Note: The feedback service encountered technical issues. We\'re showing basic feedback instead.');
              break;
            default:
              setError('Note: We\'re showing limited feedback due to a temporary technical issue.');
          }
        } else {
          setError('Note: We\'re showing limited feedback due to a temporary connection issue.');
        }
      } else if (isPartial || hasLimitedData) {
        setError('Some feedback features may be limited due to processing issues with your journal entry.');
      }
    } catch (err) {
      console.error('Error parsing feedback data:', err);
      setError('Failed to load feedback data. Please go back and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  // Removed handleVocabToggle as it's no longer needed

  const handleSaveHighlight = (text: string) => {
    console.log('handleSaveHighlight called with:', text);
    // Avoid duplicates
    if (!highlights.includes(text)) {
      console.log('Adding new highlight to state');
      setHighlights(prev => {
        const newHighlights = [...prev, text];
        console.log('New highlights array:', newHighlights);
        return newHighlights;
      });
    } else {
      console.log('Text already exists in highlights, not adding duplicate');
    }
  };

  const handleRemoveHighlight = (index: number) => {
    // Get the text of the highlight being removed
    const textToRemove = highlights[index];
    
    // Remove the highlight from the state
    setHighlights(prev => prev.filter((_, i) => i !== index));
    
    // Find and remove the highlight from the DOM
    const container = document.getElementById('improved-version-content');
    if (container) {
      const highlightElements = container.querySelectorAll(`.${styles['highlighted-text']}`);
      
      // Loop through highlight elements and find the one with matching text
      highlightElements.forEach(element => {
        if (element.textContent === textToRemove) {
          // Replace the highlighted span with its text content
          const textNode = document.createTextNode(element.textContent);
          element.parentNode?.replaceChild(textNode, element);
        }
      });
    }
  };

  const handleProcessHighlights = async () => {
    if (highlights.length === 0) {
      setError('Please highlight some text first.');
      return;
    }
    
    // Show loading state with breathing animation
    setProcessingHighlights(true);
    
    // Save journal and process highlights, then redirect to flashcards creation page
    await saveJournalAndHighlights(highlights, true);
  };

  // Removed handleSaveVocab as it's no longer needed
  
  if (loading || isLoading || processingHighlights) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <BreathingLoader 
          message={processingHighlights ? "Processing your highlights" : "Preparing your feedback"} 
        />
      </div>
    );
  }
  
  if (error || !feedback) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Feedback Not Available</h2>
              <p className="text-gray-600 mb-8">{error || 'No feedback data found'}</p>
              <Button onClick={() => router.back()}>
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="text-3xl mr-2">💬</span> Journal Feedback
          </h1>
          
          {/* Title Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Title Suggestion</h2>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              {feedback.title}
            </div>
          </div>
          
          {/* Summary Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Summary</h2>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              {feedback.summary}
            </div>
          </div>
          
          {/* Original Version Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Original Version</h2>
            <div 
              id="original-version-content"
              className="p-4 bg-gray-50 rounded-lg border border-gray-200 whitespace-pre-wrap relative"
            >
              {feedback.originalVersion}
            </div>
          </div>
          
          {/* Improved Version Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Improved Version</h2>
            <div className="relative">
              <div 
                id="improved-version-content"
                className="p-4 bg-gray-50 rounded-lg border border-gray-200 whitespace-pre-wrap"
                data-testid="improved-version"
              >
                {feedback.improvedVersion}
              </div>
            </div>
            {/* Render HighlightSelector at the component level */}
            <HighlightSelector 
              containerId="improved-version-content" 
              onHighlightSaved={handleSaveHighlight}
              highlights={highlights}
            />
          </div>
          
          {/* Highlights Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Saved Highlights</h2>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <HighlightList 
                highlights={highlights} 
                onRemove={handleRemoveHighlight} 
              />
            </div>
          </div>
          {/* Vocabulary Suggestions section removed as per new requirements */}
          
          <div className="flex justify-end gap-4 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                // Return to the journal editing page, preserving content
                const originalContent = feedback?.originalVersion || '';
                localStorage.setItem('editJournalContent', originalContent);
                localStorage.setItem('editJournalTitle', feedback?.title || '');
                router.push('/journal/new?edit=true');
              }}
            >
              Edit Journal
            </Button>
            
            {highlights.length > 0 ? (
              <Button
                onClick={handleProcessHighlights}
                disabled={processingHighlights}
              >
                {processingHighlights ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Save Journal and Process Highlights'
                )}
              </Button>
            ) : (
              <Button
                onClick={() => saveJournalAndHighlights([], false)}
                disabled={processingHighlights}
              >
                {processingHighlights ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Save Journal'
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}