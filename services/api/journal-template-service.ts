import { JournalTemplate, JournalTemplateCategory, TEMPLATE_CATEGORIES } from '@/types/journal';

/**
 * Service for fetching and managing journal templates
 */
class JournalTemplateService {
  /**
   * Fetch all available journal templates grouped by category
   * 
   * Categorization is done by:
   * 1. Using the explicit category field if available
   * 2. Falling back to finding a tag that matches a valid category
   * 3. Using the first tag as a category if it's valid
   * 4. Defaulting to the first category if no match is found
   * 
   * @returns Promise with templates grouped by category
   */
  async getTemplatesByCategory(): Promise<Record<JournalTemplateCategory, JournalTemplate[]>> {
    try {
      const response = await fetch('/api/journal-templates');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `Failed to fetch journal templates: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      const templates: JournalTemplate[] = await response.json();
      
      // Group templates by category
      const result = {} as Record<JournalTemplateCategory, JournalTemplate[]>;
      
      // Initialize categories
      TEMPLATE_CATEGORIES.forEach(category => {
        result[category] = [];
      });
      
      // Assign templates to categories based on explicit category field first
      templates.forEach(template => {
        // Use the explicit category field if available
        if (template.category && TEMPLATE_CATEGORIES.includes(template.category)) {
          result[template.category].push(template);
        } else {
          // Fallback to tag-based categorization if category field is not set
          // Try to find a matching category from the tags
          const categoryTag = template.tag.find(tag => 
            TEMPLATE_CATEGORIES.includes(tag as JournalTemplateCategory)
          ) as JournalTemplateCategory | undefined;
          
          if (categoryTag && result[categoryTag]) {
            result[categoryTag].push(template);
          } else if (template.tag.length > 0 && TEMPLATE_CATEGORIES.includes(template.tag[0] as JournalTemplateCategory)) {
            // Use first tag as category if it's a valid category
            const firstCategory = template.tag[0] as JournalTemplateCategory;
            result[firstCategory].push(template);
          } else {
            // Default to first category if no match found
            result[TEMPLATE_CATEGORIES[0]].push(template);
          }
        }
      });
      
      return result;
    } catch (error) {
      console.error('Error fetching journal templates:', error);
      throw error;
    }
  }

  /**
   * Get a specific journal template by ID
   * @param id The template ID
   * @returns Promise with the template
   */
  async getTemplateById(id: string): Promise<JournalTemplate> {
    try {
      // Set a longer timeout for this request (15 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(`/api/journal-templates/${id}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        next: { revalidate: 60 } // Cache for 60 seconds
      });
      
      clearTimeout(timeoutId); // Clear the timeout
      
      if (!response.ok) {
        // Try to get detailed error message
        let errorMessage = `Failed to fetch journal template: ${response.status}`;
        
        try {
          const errorData = await response.json();
          if (errorData && errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (jsonError) {
          // If we can't parse JSON error, use the default message
          console.log('Could not parse error response:', jsonError);
        }
        
        throw new Error(errorMessage);
      }

      // Parse the response and validate the data structure
      const data = await response.json();
      
      // Handle possible nested data structure (for API compatibility)
      if (data && Array.isArray(data) && data.length > 0 && data[0].data) {
        // Handle the array of data with nested structure
        const templateData = data[0].data.find((t: any) => t.id === id || t.id.toString() === id.toString());
        
        if (templateData) {
          return {
            id: templateData.id,
            name: templateData.name || 'Untitled Template',
            content: templateData.content || '',
            other: templateData.other || '',
            category: templateData.category || 'Journaling',
            tag: Array.isArray(templateData.tag) ? templateData.tag : []
          };
        }
      }
      
      // Ensure we have at least the required fields (id, name)
      if (!data || !data.id || !data.name) {
        console.error('Invalid template data structure:', data);
        throw new Error('Invalid template data structure received from API');
      }
      
      return {
        id: data.id,
        name: data.name,
        content: data.content || '',
        other: data.other || '',
        category: data.category || 'Journaling',
        tag: Array.isArray(data.tag) ? data.tag : []
      };
    } catch (error) {
      console.error(`Error fetching journal template with id ${id}:`, error);
      throw error;
    }
  }
}

export const journalTemplateService = new JournalTemplateService();