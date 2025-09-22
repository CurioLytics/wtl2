'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BreathingLoader } from '@/components/ui/breathing-loader';
import { Flashcard } from '@/types/flashcard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/auth/use-auth';

export default function FlashcardCreationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [useMockApi, setUseMockApi] = useState(false);

  // Helper function to load test data
  const loadTestData = () => {
    // Using the exact sample data format provided
    const testData = `[
  {
    "output": [
      {
        "word": "reasonable",
        "back": {
          "definition": "Fair and sensible.",
          "example": "Whether extending by two weeks is ___."
        }
      },
      {
        "word": "wisdom",
        "back": {
          "definition": "The ability to use your knowledge and experience to make good decisions and judgments.",
          "example": "Seeing ___ and calmness in you."
        }
      },
      {
        "word": "calmness",
        "back": {
          "definition": "The quality of being free from agitation, excitement, or disturbance.",
          "example": "Seeing wisdom and ___ in you."
        }
      },
      {
        "word": "seek",
        "back": {
          "definition": "To try to find something or someone.",
          "example": "___ common ground."
        }
      },
      {
        "word": "awkward",
        "back": {
          "definition": "Causing difficulty; hard to do or deal with.",
          "example": "___ situations."
        }
      },
      {
        "word": "rest assured",
        "back": {
          "definition": "Used to emphasize that what you are saying is true or will definitely happen.",
          "example": "___, everything will be fine."
        }
      }
    ]
  }
]`;
    localStorage.setItem('flashcardData', testData);
    return testData;
  };

  useEffect(() => {
    // Retrieve flashcard data from localStorage
    let storedData = localStorage.getItem('flashcardData');
    
    // For development testing - uncomment to test with sample data
    if (!storedData) {
      storedData = loadTestData();
      console.log('Using test data to simulate webhook response');
    }
    
    if (!storedData) {
      setError('No flashcard data found. Please go back and try again.');
      setIsLoading(false);
      return;
    }
    
    try {
      const parsedData = JSON.parse(storedData);
      console.log('Parsed flashcard data:', JSON.stringify(parsedData, null, 2));
      
      // Extract flashcards from the response structure - handle various possible formats
      let extractedFlashcards: Flashcard[] | null = null;
      
      // Format 1: [{ output: [{ word, back }] }]
      if (Array.isArray(parsedData) && parsedData.length > 0 && Array.isArray(parsedData[0].output)) {
        extractedFlashcards = parsedData[0].output;
      } 
      // Format 2: { output: [{ word, back }] }
      else if (parsedData && Array.isArray(parsedData.output)) {
        extractedFlashcards = parsedData.output;
      }
      // Format 3: Using the exact sample provided: [{ output: [...] }]
      else if (Array.isArray(parsedData) && parsedData.length > 0) {
        const firstItem = parsedData[0];
        if (firstItem && Array.isArray(firstItem.output)) {
          extractedFlashcards = firstItem.output;
        }
      }
      
      if (extractedFlashcards && extractedFlashcards.length > 0) {
        // Validate that each flashcard has the required structure
        const validFlashcards = extractedFlashcards.filter(card => 
          card && 
          typeof card.word === 'string' && 
          card.back && 
          typeof card.back.definition === 'string' &&
          typeof card.back.example === 'string'
        );
        
        if (validFlashcards.length > 0) {
          setFlashcards(validFlashcards);
        } else {
          console.error('No valid flashcards found in data');
          setError('No valid flashcards found in the response data.');
        }
      } else {
        console.error('Invalid data structure:', parsedData);
        setError('Invalid flashcard data format. Please go back and try again.');
      }
    } catch (err) {
      console.error('Error parsing flashcard data:', err);
      setError('Failed to load flashcard data. Please go back and try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Handle edits to flashcard front (word)
  const handleWordChange = (index: number, newWord: string) => {
    setFlashcards(prev => 
      prev.map((card, i) => 
        i === index ? { ...card, word: newWord } : card
      )
    );
  };
  
  // Handle edits to flashcard definition
  const handleDefinitionChange = (index: number, newDefinition: string) => {
    setFlashcards(prev => 
      prev.map((card, i) => 
        i === index ? { ...card, back: { ...card.back, definition: newDefinition } } : card
      )
    );
  };
  
  // Handle edits to flashcard example
  const handleExampleChange = (index: number, newExample: string) => {
    setFlashcards(prev => 
      prev.map((card, i) => 
        i === index ? { ...card, back: { ...card.back, example: newExample } } : card
      )
    );
  };
  
  // Delete flashcard
  const handleDeleteFlashcard = (index: number) => {
    setFlashcards(prev => prev.filter((_, i) => i !== index));
  };
  
  // Validate flashcards before saving
  const validateFlashcards = (cards: Flashcard[]): boolean => {
    if (!cards || cards.length === 0) {
      setError('No flashcards to save.');
      return false;
    }
    
    // Check each flashcard for required fields
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      
      if (!card.word || card.word.trim() === '') {
        setError(`Flashcard #${i + 1} is missing the word/phrase on the front side.`);
        return false;
      }
      
      if (!card.back?.definition || card.back.definition.trim() === '') {
        setError(`Flashcard #${i + 1} is missing the definition.`);
        return false;
      }
      
      if (!card.back?.example || card.back.example.trim() === '') {
        setError(`Flashcard #${i + 1} is missing the example.`);
        return false;
      }
    }
    
    return true;
  };

  // Mock webhook function for testing without actual API
  const mockWebhookCall = async (payload: any) => {
    console.log("🔧 Using mock webhook instead of real API");
    console.log("📦 Mock received payload:", payload);
    
    // Simulate network delay (1-2 seconds)
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    // Always return success
    return {
      success: true,
      message: "Vocabulary saved successfully (mock)",
      savedCount: payload.flashcards.length,
      timestamp: new Date().toISOString()
    };
  };

  // Save flashcards to webhook
  const handleSaveFlashcards = async () => {
    setIsLoading(true);
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);
    setDebugInfo(null);
    
    // Security validation - ensure user is authenticated
    if (!user?.id) {
      setError('You need to be logged in to save vocabulary items.');
      setIsLoading(false);
      setIsSaving(false);
      return;
    }
    
    // Validate flashcards before saving
    if (!validateFlashcards(flashcards)) {
      setIsLoading(false);
      setIsSaving(false);
      return;
    }
    
    // Create a timeout that will trigger after 10 seconds
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Request timed out after 10 seconds. Please try again.'));
      }, 10000);
    });
    
    try {
      console.log("🔍 Starting to save vocabulary items...");
      
      // Prepare the payload with user_id and flashcards
      const payload = {
        user_id: user.id,
        flashcards: flashcards.map(card => ({
          front: card.word,
          back: {
            definition: card.back.definition,
            example: card.back.example
          }
        }))
      };
      
      console.log("📦 Prepared payload:", JSON.stringify(payload, null, 2));
      
      let responseData;
      let responseOk = false;
      let responseStatus = 0;
      let responseStatusText = "";
      let responseHeaders = new Headers();
      
      if (useMockApi) {
        // Use mock webhook implementation
        try {
          // Race between the mock call and the timeout
          responseData = await Promise.race([
            mockWebhookCall(payload),
            timeoutPromise
          ]);
          responseOk = true;
          responseStatus = 200;
          responseStatusText = "OK (Mock)";
          console.log("✅ Mock webhook returned:", responseData);
        } catch (mockError) {
          throw new Error(`Mock API error: ${mockError instanceof Error ? mockError.message : 'Unknown error'}`);
        }
      } else {
        // Use real API
        try {
          console.log("🌐 Sending request to webhook...");
          
          // Create the fetch promise
          const fetchPromise = fetch('https://auto.zephyrastyle.com/webhook/save-flashcards', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });
          
          // Race between the fetch and the timeout
          const response = await Promise.race([fetchPromise, timeoutPromise]);
          
          responseStatus = response.status;
          responseStatusText = response.statusText;
          responseOk = response.ok;
          responseHeaders = response.headers;
          
          console.log(`📡 Response received: ${responseStatus} ${responseStatusText}`);
          
          // Clone the response before reading the body
          // This way we can try different parsing methods without consuming the stream
          const responseClone = response.clone();
          
          // Try to parse response as JSON
          try {
            responseData = await response.json();
            console.log("📥 Response data (JSON):", JSON.stringify(responseData, null, 2));
          } catch (jsonError) {
            console.warn("⚠️ Could not parse response as JSON, trying text...");
            // Use the cloned response for text parsing
            const textData = await responseClone.text();
            console.log("📄 Response text:", textData);
            responseData = { rawText: textData };
          }
          
          // Handle non-OK responses
          if (!responseOk) {
            throw new Error(responseData?.error || `API returned status ${responseStatus} ${responseStatusText}`);
          }
        } catch (networkError) {
          console.error("🔌 Network error:", networkError);
          
          // Check for specific error types
          if (networkError instanceof Error) {
            if (networkError.message?.includes('timed out')) {
              throw new Error(`Request timed out after 10 seconds. The server may be experiencing high traffic or issues. Please try again.`);
            } else if (networkError.message?.includes('CORS')) {
              throw new Error(`CORS error: The server doesn't allow requests from this application. This is likely a server configuration issue.`);
            } else if (networkError.message?.includes('Failed to fetch') || networkError.message?.includes('Network error')) {
              throw new Error(`Network error: Could not connect to the server. Please check your internet connection and try again.`);
            }
          }
          throw networkError;
        }
      }
      
      // Collect debug info
      setDebugInfo({
        requestPayload: payload,
        responseStatus,
        responseStatusText,
        responseHeaders: responseHeaders instanceof Headers ? Object.fromEntries(responseHeaders.entries()) : responseHeaders,
        responseData,
        mockApi: useMockApi
      });
      
      console.log("✅ Vocabulary saved successfully!");
      
      // Clear localStorage only after successful response
      localStorage.removeItem('flashcardData');
      
      // Show success message
      setSaveSuccess(true);
      
      // After a short delay, redirect to the vocab hub page
      setTimeout(() => {
        router.push('/vocab');
      }, 3000); // 3-second delay to show success message
      
    } catch (err) {
      console.error("❌ Error saving vocabulary:", err);
      
      // Collect debug info for errors too
      setDebugInfo({
        error: err instanceof Error ? {
          name: err.name,
          message: err.message,
          stack: err.stack
        } : String(err),
        timestamp: new Date().toISOString(),
        mockApi: useMockApi
      });
      
      // Handle network errors specifically
      if (err instanceof Error && err.message.includes('timed out')) {
        setError('Request timed out after 10 seconds. The server may be experiencing high traffic. You can try again or continue editing your flashcards.');
      } else if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Network error: Could not connect to the server. Please check your internet connection and try saving again.');
      } else if (err instanceof SyntaxError) {
        setError('Error parsing server response. Please try saving again.');
      } else if (err instanceof Error) {
        // Display the specific error message
        setError(`Error: ${err.message}`);
      } else {
        setError('An unknown error occurred while saving vocabulary items. Please try again.');
      }
      
      // Keep users in the editing screen, don't redirect
    } finally {
      setIsLoading(false);
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <BreathingLoader 
            message={isSaving ? 
              "Saving your flashcards to Vocab Hub..." : 
              "Processing your flashcards..."}
          />
          <p className="text-sm text-gray-500 mt-2">
            {isSaving ? "This may take up to 10 seconds" : "Getting things ready"}
          </p>
        </div>
      </div>
    );
  }
  
  // Success message display
  if (saveSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center py-10">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-green-100">
                <span className="text-3xl" role="img" aria-label="success">✅</span>
              </div>
              <h2 className="text-2xl font-bold text-green-700 mb-3">Flashcards Saved Successfully!</h2>
              <p className="text-lg text-gray-600 mb-2">
                {flashcards.length} {flashcards.length === 1 ? 'flashcard has' : 'flashcards have'} been added to your Vocab Hub
              </p>
              <p className="text-gray-500 mb-6">
                Redirecting to vocabulary hub in a few seconds...
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Button onClick={() => router.push('/vocab')} className="bg-green-600 hover:bg-green-700">
                  Go to Vocab Hub Now
                </Button>
                <Button onClick={() => router.push('/flashcards/create')} variant="outline" className="border-green-600 text-green-600">
                  Create More Flashcards
                </Button>
              </div>
            </div>
          </div>
          
          {/* Additional tips */}
          <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-medium text-gray-800 mb-3">What's Next?</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="mr-2">🔄</span>
                <span>Review your flashcards regularly to improve retention</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">📝</span>
                <span>Create different card sets for various topics or difficulty levels</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🎯</span>
                <span>Track your progress in the Vocab Hub dashboard</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Error or no flashcards display
  if (error || flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {error ? (
            // Error state
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-red-100">
                  <span className="text-3xl" role="img" aria-label="error">❌</span>
                </div>
                <h2 className="text-2xl font-bold text-red-700 mb-3">
                  Error Saving Flashcards
                </h2>
                
                <div className="mb-8 max-w-2xl mx-auto">
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700 font-medium">{error}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-left bg-gray-50 p-5 rounded-md border border-gray-200">
                    <h3 className="font-medium text-gray-800 mb-3">What should I do?</h3>
                    
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-5 w-5 text-green-500 mr-2">✓</span>
                        <span className="text-gray-700">Don't worry, your flashcards are still saved in your browser</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-5 w-5 text-green-500 mr-2">✓</span>
                        <span className="text-gray-700">Click "Try Again" to attempt saving without reloading the page</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-5 w-5 text-green-500 mr-2">✓</span>
                        <span className="text-gray-700">Check your internet connection and make sure you're logged in</span>
                      </li>
                      {error.includes('timed out') && (
                        <li className="flex items-start">
                          <span className="flex-shrink-0 h-5 w-5 text-green-500 mr-2">✓</span>
                          <span className="text-gray-700">The server might be busy - wait a minute and try again</span>
                        </li>
                      )}
                    </ul>
                    
                    {debugInfo && (
                      <div className="mt-6 border-t border-gray-200 pt-4">
                        <button
                          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                          className="text-sm flex items-center text-gray-700 hover:text-blue-600 transition-colors"
                        >
                          <span className="mr-1">{showTechnicalDetails ? '▼' : '►'}</span>
                          {showTechnicalDetails ? 'Hide' : 'Show'} Technical Details
                        </button>
                        
                        {showTechnicalDetails && (
                          <div className="mt-2 overflow-x-auto">
                            <div className="text-xs bg-gray-100 p-3 rounded font-mono whitespace-pre overflow-auto max-h-60">
                              {JSON.stringify(debugInfo, null, 2)}
                            </div>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2));
                                alert("Debug info copied to clipboard!");
                              }}
                              className="mt-2 text-xs flex items-center text-blue-600 hover:text-blue-800"
                            >
                              <span className="mr-1">📋</span> Copy to clipboard
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <Button 
                    onClick={() => {
                      setError(null);
                      setIsLoading(false);
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Try Again
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => router.push('/journal')}
                    className="border-gray-300"
                  >
                    Return to Journal
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            // No flashcards state
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-blue-100">
                  <span className="text-3xl" role="img" aria-label="note">📝</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  No Flashcards to Save
                </h2>
                
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  You don't have any flashcards ready to save. Go back to your journal and create some flashcards first.
                </p>
                
                <div className="flex justify-center">
                  <Button 
                    onClick={() => router.push('/journal')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Return to Journal
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Floating API Toggle (for development) */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-gray-800/80 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm hover:bg-gray-700/90 transition-colors">
          <span className="text-lg">🧩</span>
          <label className="inline-flex items-center cursor-pointer">
            <span className="mr-2">Use Mock API</span>
            <div className="relative">
              <input 
                type="checkbox" 
                checked={useMockApi} 
                onChange={() => setUseMockApi(!useMockApi)} 
                className="sr-only peer" 
              />
              <div className="w-9 h-5 bg-gray-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-400"></div>
            </div>
          </label>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="border-b pb-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <span className="text-3xl mr-2">📝</span> Create Vocabulary
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Generated from your highlighted text
            </p>
          </div>
          
          {/* Instructions */}
          <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Review and edit your vocabulary items below. Each has a front (word/phrase) and back (definition & example). 
                  Click the 🗑️ icon to remove unwanted items.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-700">
              {flashcards.length} Vocabulary {flashcards.length === 1 ? 'Item' : 'Items'} Ready
            </h2>
            {flashcards.length > 0 && (
              <span className="text-sm text-gray-500">
                Click fields to edit content
              </span>
            )}
          </div>
          
          {/* Flashcard list */}
          <div className="space-y-8 mb-8">
            {flashcards.map((card, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6 shadow-sm relative">
                {/* Vocabulary item header with number and delete button */}
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
                  <h3 className="font-medium text-gray-800">
                    Vocabulary #{index + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleDeleteFlashcard(index)}
                    className="text-gray-500 hover:text-red-600 focus:outline-none transition-colors"
                    aria-label="Delete vocabulary item"
                    title="Delete vocabulary item"
                  >
                    <span className="text-xl">🗑️</span>
                  </button>
                </div>
                
                {/* Flashcard content */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Front side */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <label htmlFor={`word-${index}`} className="block text-sm font-medium text-blue-700 mb-2">
                      Front (Word/Phrase)
                    </label>
                    <textarea
                      id={`word-${index}`}
                      className="w-full p-3 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      rows={3}
                      value={card.word}
                      onChange={(e) => handleWordChange(index, e.target.value)}
                      placeholder="Enter the word or phrase"
                    />
                  </div>
                  
                  {/* Back side */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="mb-3">
                      <p className="block text-sm font-medium text-green-700 mb-1">Back</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor={`definition-${index}`} className="block text-xs font-medium text-green-700 mb-1">
                          Definition
                        </label>
                        <textarea
                          id={`definition-${index}`}
                          className="w-full p-3 border border-green-200 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                          rows={2}
                          value={card.back.definition}
                          onChange={(e) => handleDefinitionChange(index, e.target.value)}
                          placeholder="Enter the definition"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor={`example-${index}`} className="block text-xs font-medium text-green-700 mb-1">
                          Example (with ___ for blanks)
                        </label>
                        <textarea
                          id={`example-${index}`}
                          className="w-full p-3 border border-green-200 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                          rows={2}
                          value={card.back.example}
                          onChange={(e) => handleExampleChange(index, e.target.value)}
                          placeholder="Enter an example using ___ for the blank"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Synonyms (if available) */}
                {card.back.synonyms && card.back.synonyms.length > 0 && (
                  <div className="mt-4 bg-gray-50 p-3 rounded-lg">
                    <h4 className="text-xs font-medium text-gray-700 mb-2">Synonyms</h4>
                    <div className="flex flex-wrap gap-2">
                      {card.back.synonyms.map((synonym, i) => (
                        <span key={i} className="bg-gray-200 text-gray-800 text-sm px-3 py-1 rounded-full">
                          {synonym}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Error message - only show one instance */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6">
              <div className="flex flex-col">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 font-medium">Error Saving Flashcards</p>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  </div>
                </div>
                
                {/* Try Again button */}
                <div className="mt-4 flex justify-end">
                  <button 
                    onClick={handleSaveFlashcards} 
                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-8 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                {flashcards.length === 0 && (
                  <p className="text-amber-600 flex items-center">
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                    </svg>
                    No flashcards to save
                  </p>
                )}
              </div>
              <div className="flex space-x-4">
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/journal')}
                  className="px-6"
                >
                  Return to Journal
                </Button>
                <Button 
                  onClick={handleSaveFlashcards}
                  disabled={isLoading || flashcards.length === 0}
                  className="px-6 bg-teal-500 hover:bg-teal-600"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    <>
                      <span className="mr-2">💾</span> Save to Vocab Hub
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}