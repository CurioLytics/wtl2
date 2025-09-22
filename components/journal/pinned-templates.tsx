'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/use-auth';
import { MinimalTemplateCard } from './minimal-template-card';
import { PinnedTemplate, fetchPinnedTemplates } from '@/services/api/template-service';

// Helper function to determine template category from title
function determineCategory(title: string): string {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('morning') || lowerTitle.includes('gratitude') || 
      lowerTitle.includes('journal') || lowerTitle.includes('reflection')) {
    return 'Journaling';
  } else if (lowerTitle.includes('goal') || lowerTitle.includes('task') || 
             lowerTitle.includes('minimalism') || lowerTitle.includes('productivity')) {
    return 'Productivity';
  } else if (lowerTitle.includes('learning') || lowerTitle.includes('study') || 
             lowerTitle.includes('education')) {
    return 'Learning';
  } else {
    return 'General';
  }
}

interface PinnedTemplatesProps {
  limit?: number;
}

export function PinnedTemplates({ limit = 4 }: PinnedTemplatesProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [templates, setTemplates] = useState<PinnedTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<PinnedTemplate | null>(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  // Fallback templates in case of error or empty response
  const fallbackTemplates: PinnedTemplate[] = [
    {
      id: '1',
      title: 'Morning Check-in',
      category: 'Journaling'
    },
    {
      id: '2',
      title: 'Minimalism Prompt',
      category: 'Productivity'
    }
  ];

  useEffect(() => {
    async function loadTemplates() {
      setLoading(true);
      setError(null);
      
      try {
        if (!user?.id) {
          // If no user ID, use fallback templates but show message
          setTemplates(fallbackTemplates);
          setError('No user ID available. Using default templates.');
          return;
        }
        
        // Make direct API call to capture the raw response
        const response = await fetch('https://auto.zephyrastyle.com/webhook/get-pinned-template', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ profileId: user.id })
        });

        // Save the response status and headers for debugging
        const responseInfo = {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
        };

        let responseData: any;
        
        // Try to parse response as JSON
        try {
          responseData = await response.json();
          // Store the raw API response for debugging
          setApiResponse({ 
            info: responseInfo,
            data: responseData 
          });
        } catch (jsonError) {
          // Handle JSON parsing errors
          setApiResponse({ 
            info: responseInfo,
            error: 'Failed to parse JSON response',
            errorDetails: (jsonError as Error).message
          });
          throw new Error(`Failed to parse JSON response: ${(jsonError as Error).message}`);
        }

        // Process the response data using our service function
        let fetchedTemplates: PinnedTemplate[] = [];
        
        // Handle the nested response structure (array format)
        if (Array.isArray(responseData) && responseData.length > 0 && responseData[0].data) {
          fetchedTemplates = responseData[0].data.map((template: any) => ({
            id: template.id,
            title: template.name, // 'name' in API maps to 'title' in our app
            category: template.category || determineCategory(template.name), // Use category if available or infer
            content: template.content
          }));
        } 
        // Handle direct data property format (what we're seeing in your debug output)
        else if (responseData.data && Array.isArray(responseData.data)) {
          fetchedTemplates = responseData.data.map((template: any) => ({
            id: template.id,
            title: template.name, // 'name' in API maps to 'title' in our app
            category: template.category || determineCategory(template.name), // Use category if available or infer
            content: template.content
          }));
        }
        // Original format
        else if (responseData.templates && Array.isArray(responseData.templates)) {
          fetchedTemplates = responseData.templates;
        }
        
        if (fetchedTemplates.length > 0) {
          setTemplates(fetchedTemplates);
        } else {
          // If no templates returned, use fallback templates but show message
          setError('No templates returned from API. Using default templates.');
          setTemplates(fallbackTemplates);
        }
      } catch (err) {
        console.error('Error fetching templates:', err);
        // Show detailed error message
        setError(`API Error: ${(err as Error).message}. Using default templates instead.`);
        setTemplates(fallbackTemplates);
      } finally {
        setLoading(false);
      }
    }
    
    loadTemplates();
  }, [user?.id]);

  const handleTemplateClick = (template: PinnedTemplate) => {
    // If already selected, toggle it off (unselect)
    if (selectedTemplate?.id === template.id) {
      setSelectedTemplate(null);
    } else {
      // Otherwise, select the new template
      setSelectedTemplate(template);
    }
  };

  const handleStartWriting = () => {
    if (selectedTemplate) {
      router.push(`/journal/new?templateId=${selectedTemplate.id}`);
    } else {
      router.push('/journal/new');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-5">
      <div className="flex justify-between items-center mb-4">
      {/* Debug toggle button for developers */}
      {process.env.NODE_ENV !== 'production' && (
        <button
        onClick={() => setShowDebugInfo(!showDebugInfo)}
        className="text-xs text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
        >
        {showDebugInfo ? 'Hide Debug Info' : 'Show Debug Info'}
        </button>
        )}
      </div>
      
      {loading ? (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-4 text-sm text-amber-600 bg-amber-50 p-2 rounded">
              {error}
            </div>
          )}
          
          {/* Debug information panel */}
          {showDebugInfo && apiResponse && (
            <div className="mb-4 text-xs border border-gray-200 rounded p-2 bg-gray-50 overflow-auto max-h-60">
              <h3 className="font-medium mb-1">API Response Debug Info</h3>
              <div className="mb-2">
                <strong>Status:</strong> {apiResponse.info?.status} {apiResponse.info?.statusText}
              </div>
              {apiResponse.error ? (
                <div className="text-red-600">
                  <strong>Error:</strong> {apiResponse.error}
                  {apiResponse.errorDetails && (
                    <div className="ml-2">{apiResponse.errorDetails}</div>
                  )}
                </div>
              ) : (
                <>
                  <details>
                    <summary className="cursor-pointer hover:text-blue-600">View Response Headers</summary>
                    <pre className="text-xs mt-1 p-1 bg-gray-100 rounded">
                      {JSON.stringify(apiResponse.info?.headers, null, 2)}
                    </pre>
                  </details>
                  <details>
                    <summary className="cursor-pointer hover:text-blue-600 mt-2">View Response Data</summary>
                    <pre className="text-xs mt-1 p-1 bg-gray-100 rounded">
                      {JSON.stringify(apiResponse.data, null, 2)}
                    </pre>
                  </details>
                </>
              )}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
            {templates.slice(0, limit).map((template) => (
              <MinimalTemplateCard
                key={template.id}
                template={template}
                onClick={handleTemplateClick}
                isSelected={selectedTemplate?.id === template.id}
              />
            ))}
          </div>
          
          {selectedTemplate && (
            <div className="flex flex-col items-center mb-4">
              <p className="text-xs text-gray-500 text-center">
                Template content will be automatically loaded in the editor
              </p>
              <button 
                onClick={() => setSelectedTemplate(null)}
                className="mt-2 text-xs text-blue-600 hover:text-blue-800 hover:underline"
              >
                Clear selection
              </button>
            </div>
          )}
          
          <div className="flex justify-center">
            <Button 
              className={`flex items-center ${selectedTemplate 
                ? 'bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 text-sm rounded-md font-normal' 
                : 'bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-base rounded-md font-medium'}`}
              onClick={handleStartWriting}
            >
              {selectedTemplate 
                ? <span>Start with this template <span className="ml-1">→</span></span>
                : <span>Start with blank page <span className="ml-1">→</span></span>
              }
            </Button>
          </div>
        </>
      )}
    </div>
  );
}