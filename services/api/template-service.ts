'use client';

import { useAuth } from '@/hooks/auth/use-auth';

export interface PinnedTemplate {
  id: string;
  title: string;
  category: string;
  content?: string;
}

// API response structure
interface ApiTemplateResponse {
  data?: {
    id: string;
    name: string;
    content: string;
    category?: string;  // Category might not be in the response
  }[];
}

/**
 * Fetches pinned templates from the webhook API
 * @param profileId The user profile ID
 * @returns Promise with the pinned templates
 */
export async function fetchPinnedTemplates(profileId: string): Promise<PinnedTemplate[]> {
  try {
    const response = await fetch('https://auto.zephyrastyle.com/webhook/get-pinned-template', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ profileId })
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch pinned templates: ${response.status}`);
    }

    const responseData = await response.json();
    
    // Handle the nested response structure
    if (Array.isArray(responseData) && responseData.length > 0 && responseData[0].data) {
      // Map the API response to our PinnedTemplate format
      return responseData[0].data.map((template: any) => ({
        id: template.id,
        title: template.name, // 'name' in API maps to 'title' in our app
        category: template.category || determineCategory(template.name), // Use the category if available or infer from name
        content: template.content
      }));
    }
    
    // Default case for the original expected response format
    if (responseData.templates && Array.isArray(responseData.templates)) {
      return responseData.templates;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching pinned templates:', error);
    throw error;
  }
}

/**
 * Helper function to determine a category based on template name
 * This helps when the API doesn't provide a category
 */
function determineCategory(name: string): string {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('reflection') || lowerName.includes('journal') || lowerName.includes('diary')) {
    return 'Journaling';
  } else if (lowerName.includes('problem') || lowerName.includes('solution')) {
    return 'Problem Solving';
  } else if (lowerName.includes('goal') || lowerName.includes('task') || lowerName.includes('plan')) {
    return 'Productivity';
  } else if (lowerName.includes('wellness') || lowerName.includes('health') || lowerName.includes('mindful')) {
    return 'Wellness';
  } else if (lowerName.includes('decision') || lowerName.includes('choice')) {
    return 'Decision Making';
  } else if (lowerName.includes('business') || lowerName.includes('work')) {
    return 'Business';
  } else if (lowerName.includes('personal') || lowerName.includes('life')) {
    return 'Personal';
  } else if (lowerName.includes('learn') || lowerName.includes('study')) {
    return 'Learning';
  }
  
  // Default category if no matches
  return 'Journaling';
}

/**
 * Custom hook for accessing pinned templates
 */
export function usePinnedTemplates() {
  const { user } = useAuth();
  
  const getPinnedTemplates = async () => {
    if (!user?.id) {
      return [];
    }
    
    try {
      return await fetchPinnedTemplates(user.id);
    } catch (error) {
      console.error('Error in usePinnedTemplates hook:', error);
      return [];
    }
  };
  
  return { getPinnedTemplates };
}