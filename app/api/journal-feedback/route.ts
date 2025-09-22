import { NextRequest, NextResponse } from 'next/server';
import { JournalFeedback, JournalFeedbackContent, WebhookResponse } from '@/types/journal';

/**
 * Helper function to fetch with retry logic
 */
async function fetchWithRetry(
  url: string, 
  options: RequestInit, 
  maxRetries = 2, 
  retryDelay = 5000
): Promise<Response> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Only delay if it's not the first attempt
      if (attempt > 0) {
        console.log(`Retry attempt ${attempt} for ${url}`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
      
      return await fetch(url, options);
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt} failed:`, error);
    }
  }
  
  throw lastError || new Error(`Failed after ${maxRetries} retries`);
}

/**
 * Server-side proxy to the external journal feedback API
 * This helps avoid CORS issues and provides better error handling
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { content, title } = body;
    
    // Validate required fields
    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' }, 
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Log request (exclude full content for readability)
    console.log('Processing feedback request', {
      contentLength: content?.length || 0,
      title
    });
    
    try {
      // Set timeout for the fetch call (60 seconds - increased from 15 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // Increased to 60 seconds
      
      try {
        // Prepare the request options
        const requestOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content, title }),
          signal: controller.signal
        };
        
        // Call the external API with timeout and retry logic
        console.log('Making request to external feedback API with retry logic');
        const response = await fetchWithRetry(
          'https://auto.zephyrastyle.com/webhook/journal-feedback',
          requestOptions,
          1, // 1 retry (2 attempts total)
          3000 // 3 second delay between retries
        );
        
        // Clear the timeout
        clearTimeout(timeoutId);
        
        // Get response data as text first
        const responseText = await response.text();
        
        // Log the raw response for debugging
        console.log(`External API responded with status ${response.status}, content length: ${responseText.length}`);
        
        // Check if the response is valid
        if (!response.ok) {
          console.error('External API error:', responseText.substring(0, 500));
          return NextResponse.json(
            { error: `External API returned an error: ${response.status}` },
            { 
              status: response.status,
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
        }
        
        // Check for empty response
        if (!responseText || responseText.trim() === '') {
          console.error('External API returned empty response');
          return NextResponse.json(
            { 
              title: title || 'Journal Entry',
              summary: 'No summary available from the service at this time.',
              improvedVersion: content,
              vocabSuggestions: []
            },
            {
              status: 200,
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
        }
        
        // Try to parse response as JSON
        let rawData: any;
        try {
          rawData = JSON.parse(responseText);
          
          // Enhanced detailed logging for debugging the exact structure
          console.log('Response structure type:', typeof rawData);
          console.log('Is array:', Array.isArray(rawData));
          console.log('Response root keys:', Array.isArray(rawData) 
            ? 'Array with ' + rawData.length + ' items' 
            : typeof rawData === 'object' && rawData !== null 
              ? Object.keys(rawData) 
              : 'No keys (primitive value)');
          
          // Log first level of nesting for arrays
          if (Array.isArray(rawData) && rawData.length > 0) {
            console.log('First array item type:', typeof rawData[0]);
            if (typeof rawData[0] === 'object' && rawData[0] !== null) {
              console.log('First array item keys:', Object.keys(rawData[0]));
              
              // Check for 'output' property specifically
              if (rawData[0].hasOwnProperty('output')) {
                console.log('Output property type:', typeof rawData[0].output);
                if (typeof rawData[0].output === 'object' && rawData[0].output !== null) {
                  console.log('Output keys:', Object.keys(rawData[0].output));
                }
              }
            }
          }
          
          // For specific object structures, log deeper
          if (!Array.isArray(rawData) && typeof rawData === 'object' && rawData !== null) {
            // Check for common nested structures
            ['data', 'result', 'response', 'content', 'body'].forEach(key => {
              if (rawData[key]) {
                console.log(`Found potential container key '${key}':`, typeof rawData[key]);
                if (typeof rawData[key] === 'object' && rawData[key] !== null) {
                  console.log(`Keys inside ${key}:`, Object.keys(rawData[key]));
                }
              }
            });
          }
          
        } catch (parseError) {
          console.error('Failed to parse external API response as JSON:', responseText.substring(0, 200));
          return NextResponse.json(
            { error: 'Invalid response format from external API' },
            { 
              status: 500,
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
        }
        
        // Extract feedback content from the nested structure with enhanced flexibility
        let feedbackContent: JournalFeedbackContent | null = null;
        
        // New more flexible response parsing with multiple fallbacks
        // Scenario 1: Standard expected array with output property
        if (Array.isArray(rawData) && rawData.length > 0 && rawData[0]?.output) {
          console.log('Found standard webhook response structure: array[0].output');
          feedbackContent = rawData[0].output;
        }
        // Scenario 2: Direct object with feedback fields
        else if (rawData && typeof rawData === 'object' && (rawData.title || rawData.summary)) {
          console.log('Found direct object structure with feedback fields');
          feedbackContent = rawData as JournalFeedbackContent;
        }
        // Scenario 3: Array with direct feedback content (no output wrapper)
        else if (Array.isArray(rawData) && rawData.length > 0 && 
                (rawData[0]?.title || rawData[0]?.summary)) {
          console.log('Found array[0] with direct feedback fields');
          feedbackContent = rawData[0] as JournalFeedbackContent;
        }
        // Scenario 4: Nested in data/result/response property
        else if (rawData && typeof rawData === 'object') {
          // Check various common container property names
          for (const containerKey of ['data', 'result', 'response', 'content', 'body']) {
            const container = rawData[containerKey];
            if (container) {
              // Case 4.1: Container has direct feedback properties
              if (typeof container === 'object' && (container.title || container.summary)) {
                console.log(`Found feedback in ${containerKey} property`);
                feedbackContent = container as JournalFeedbackContent;
                break;
              }
              // Case 4.2: Container is array with feedback
              else if (Array.isArray(container) && container.length > 0) {
                // Case 4.2.1: Array item has output
                if (container[0]?.output) {
                  console.log(`Found feedback in ${containerKey}[0].output`);
                  feedbackContent = container[0].output;
                  break;
                }
                // Case 4.2.2: Array item has direct feedback fields
                else if (container[0]?.title || container[0]?.summary) {
                  console.log(`Found feedback in ${containerKey}[0] direct properties`);
                  feedbackContent = container[0] as JournalFeedbackContent;
                  break;
                }
              }
            }
          }
        }
        
        // After all scenarios, try one more attempt to extract anything meaningful
        if (!feedbackContent) {
          console.log('No standard structure found, attempting deep search for feedback components...');
          
          // Helper function to find values deeply in the response structure
          function extractValuesDeep(obj: any): Partial<JournalFeedbackContent> {
            const result: Partial<JournalFeedbackContent> = {};
            
            // Helper to search recursively for key patterns
            function findValueForKey(obj: any, patterns: string[]): string | null {
              if (!obj || typeof obj !== 'object') return null;
              
              // Direct matches first
              for (const pattern of patterns) {
                for (const key in obj) {
                  if (key.toLowerCase().includes(pattern) && typeof obj[key] === 'string' && obj[key].length > 10) {
                    return obj[key];
                  }
                }
              }
              
              // Recursive search for arrays
              if (Array.isArray(obj)) {
                for (const item of obj) {
                  const found = findValueForKey(item, patterns);
                  if (found) return found;
                }
              } 
              // Recursive search for objects
              else {
                for (const key in obj) {
                  if (typeof obj[key] === 'object' && obj[key] !== null) {
                    const found = findValueForKey(obj[key], patterns);
                    if (found) return found;
                  }
                }
              }
              
              return null;
            }
            
            // Function to extract vocabulary suggestions from any array-like structure
            function findVocabSuggestions(obj: any): any[] {
              if (!obj) return [];
              
              // Look for array properties that might contain vocabulary
              if (typeof obj === 'object') {
                for (const key in obj) {
                  // Check if this key might be a vocab array
                  if (Array.isArray(obj[key]) && ['vocab', 'vocabulary', 'words', 'terms', 'suggestions', 'dict'].some(term => 
                    key.toLowerCase().includes(term))) {
                    // Process each item
                    return obj[key].map((item: any) => {
                      // Handle string items
                      if (typeof item === 'string') {
                        return { word: item };
                      }
                      
                      // Handle object items with different structures
                      if (typeof item === 'object' && item !== null) {
                        const wordKey = Object.keys(item).find(k => 
                          ['word', 'term', 'vocab', 'name', 'key'].includes(k.toLowerCase()));
                        
                        const meaningKey = Object.keys(item).find(k => 
                          ['meaning', 'definition', 'desc', 'description', 'value'].includes(k.toLowerCase()));
                        
                        const exampleKey = Object.keys(item).find(k => 
                          ['example', 'usage', 'sentence', 'context'].includes(k.toLowerCase()));
                        
                        if (wordKey) {
                          return {
                            word: item[wordKey],
                            meaning: meaningKey ? item[meaningKey] : '',
                            example: exampleKey ? item[exampleKey] : ''
                          };
                        }
                      }
                      
                      return null;
                    }).filter(Boolean);
                  }
                }
                
                // Recursively search nested objects
                for (const key in obj) {
                  if (typeof obj[key] === 'object' && obj[key] !== null) {
                    const vocabItems = findVocabSuggestions(obj[key]);
                    if (vocabItems.length > 0) return vocabItems;
                  }
                }
              }
              
              return [];
            }
            
            // Try to find title
            const title = findValueForKey(obj, ['title', 'heading', 'name', 'subject']);
            if (title) result.title = title;
            
            // Try to find summary
            const summary = findValueForKey(obj, ['summary', 'overview', 'abstract', 'description', 'recap']);
            if (summary) result.summary = summary;
            
            // Try to find improved version
            const improvedVersion = findValueForKey(obj, ['improved', 'enhancement', 'better', 'corrected', 'updated']);
            if (improvedVersion) result.improvedVersion = improvedVersion;
            
            // Try to find vocab suggestions
            const vocabSuggestions = findVocabSuggestions(obj);
            if (vocabSuggestions.length > 0) {
              result.vocabSuggestions = vocabSuggestions;
            }
            
            return result;
          }
          
          // Extract any values we can find
          const extractedValues = extractValuesDeep(rawData);
          console.log('Deep extraction results:', {
            foundTitle: Boolean(extractedValues.title),
            foundSummary: Boolean(extractedValues.summary),
            foundImprovedVersion: Boolean(extractedValues.improvedVersion),
            foundVocabCount: extractedValues.vocabSuggestions?.length || 0
          });
          
          // If we found at least some values, use them
          if (Object.keys(extractedValues).length > 0) {
            console.log('Found some feedback components through deep search');
            feedbackContent = extractedValues as JournalFeedbackContent;
          } else {
            // Last resort - dump full structure for debugging
            console.error('Could not extract feedback from response structure. Full dump:',
              JSON.stringify(rawData, null, 2).substring(0, 1000) + '...');
            
            // Return a more descriptive error with enough info to help debugging
            return NextResponse.json(
              { 
                error: 'Unexpected response structure from external API',
                debugInfo: {
                  type: typeof rawData,
                  isArray: Array.isArray(rawData),
                  keys: typeof rawData === 'object' && rawData !== null 
                    ? (Array.isArray(rawData) 
                      ? `Array with ${rawData.length} items` 
                      : Object.keys(rawData))
                    : 'Not an object',
                  sample: typeof rawData === 'object' && rawData !== null
                    ? JSON.stringify(rawData).substring(0, 200)
                    : String(rawData).substring(0, 200)
                }
              },
              { 
                status: 500,
                headers: {
                  'Content-Type': 'application/json'
                }
              }
            );
          }
        }
        
        // Try a deep search for required fields if we have content but some fields are missing
        if (feedbackContent && Object.keys(feedbackContent).length > 0 && 
            (!feedbackContent.title || !feedbackContent.summary || !feedbackContent.improvedVersion)) {
          
          console.log('Found partial feedback content, searching for missing fields in response');
          
          // Function to find properties in a nested structure
          function findPropertyInObject(obj: any, propertyName: string): any {
            // Skip null/undefined and non-objects
            if (!obj || typeof obj !== 'object') return null;
            
            // Direct property match
            if (obj.hasOwnProperty(propertyName)) return obj[propertyName];
            
            // For arrays, search each item
            if (Array.isArray(obj)) {
              for (const item of obj) {
                const result = findPropertyInObject(item, propertyName);
                if (result !== null) return result;
              }
              return null;
            }
            
            // For objects, search each property
            for (const key of Object.keys(obj)) {
              const result = findPropertyInObject(obj[key], propertyName);
              if (result !== null) return result;
            }
            
            return null;
          }
          
          // Look for missing fields in the entire response
          if (!feedbackContent.title) {
            const foundTitle = findPropertyInObject(rawData, 'title');
            if (foundTitle && typeof foundTitle === 'string') {
              console.log('Found missing title in response');
              feedbackContent.title = foundTitle;
            }
          }
          
          if (!feedbackContent.summary) {
            const foundSummary = findPropertyInObject(rawData, 'summary');
            if (foundSummary && typeof foundSummary === 'string') {
              console.log('Found missing summary in response');
              feedbackContent.summary = foundSummary;
            }
          }
          
          if (!feedbackContent.improvedVersion) {
            // Try common names for improved version
            ['improvedVersion', 'improved_version', 'improved', 'enhancement', 'corrected', 'correctedText', 'corrected_text']
              .forEach(fieldName => {
                if (!feedbackContent.improvedVersion) {
                  const found = findPropertyInObject(rawData, fieldName);
                  if (found && typeof found === 'string') {
                    console.log(`Found missing improvedVersion as '${fieldName}' in response`);
                    feedbackContent.improvedVersion = found;
                  }
                }
              });
          }
          
          if (!feedbackContent.vocabSuggestions || !Array.isArray(feedbackContent.vocabSuggestions)) {
            // Try common names for vocab suggestions
            ['vocabSuggestions', 'vocab_suggestions', 'vocab', 'vocabulary', 'words']
              .forEach(fieldName => {
                if (!feedbackContent.vocabSuggestions || !Array.isArray(feedbackContent.vocabSuggestions)) {
                  const found = findPropertyInObject(rawData, fieldName);
                  if (found && Array.isArray(found)) {
                    console.log(`Found missing vocabSuggestions as '${fieldName}' in response`);
                    feedbackContent.vocabSuggestions = found;
                  }
                }
              });
          }
        }

        // Validate and provide defaults for missing fields
        const safeData: JournalFeedback = {
          title: feedbackContent?.title || title || 'Journal Entry',
          summary: feedbackContent?.summary || 'No summary available',
          improvedVersion: feedbackContent?.improvedVersion || content,
          originalVersion: content, // Always include the original content
          vocabSuggestions: Array.isArray(feedbackContent?.vocabSuggestions) 
            ? feedbackContent.vocabSuggestions.map(item => {
                // Handle different vocab item structures
                if (typeof item === 'string') {
                  return { word: item, meaning: '', example: '' };
                } else if (item && typeof item === 'object') {
                  const vocabItem = item as any; // Cast to any to handle diverse field names
                  return {
                    word: vocabItem.word || vocabItem.term || vocabItem.vocabulary || vocabItem.name || 'Unknown',
                    meaning: vocabItem.meaning || vocabItem.definition || vocabItem.desc || '',
                    example: vocabItem.example || vocabItem.usage || vocabItem.sentence || ''
                  };
                } else {
                  return { word: 'Unknown', meaning: '', example: '' };
                }
              })
            : []
        };
        
        // Log successful data extraction
        console.log('Successfully extracted journal feedback data', {
          hasTitle: Boolean(safeData.title),
          summaryLength: safeData.summary?.length,
          improvedVersionLength: safeData.improvedVersion?.length,
          originalVersionLength: safeData.originalVersion?.length,
          vocabCount: safeData.vocabSuggestions?.length
        });
        
        // Return the validated data
        return NextResponse.json(
          safeData,
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      } catch (abortError) {
        console.error('Request to external API timed out');
        return NextResponse.json(
          { error: 'Request to feedback service timed out' },
          { status: 504 }
        );
      }
      
      // This code should never be reached now, since we return within the try/catch above
      return NextResponse.json(
        { error: 'Unexpected code path reached' },
        { status: 500 }
      );
    } catch (fetchError: any) {
      console.error('Error fetching from external API:', fetchError);
      return NextResponse.json(
        { error: `Failed to communicate with external API: ${fetchError.message}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Unexpected error in journal feedback API:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
}