import { createSupabaseClient } from '@/services/supabase/auth-helpers';
import { JournalTemplate } from '@/types/journal';


/**
 * Service for fetching and managing journal templates
 */
class JournalTemplateService {
  /**
   * Get templates for a specific user
   * @param userId The user ID to fetch templates for
   * @returns Promise with user's templates
   */
  async getTemplatesByUserId(userId: string): Promise<JournalTemplate[]> {
    try {
      const supabase = createSupabaseClient();

      // Query frameworks table for user's custom frameworks
      const { data, error } = await supabase
        .from('frameworks')
        .select('profile_id, name, content, cover_image, category, description, is_pinned')
        .eq('profile_id', userId)
        .order('name');

      if (error) {
        console.error('Error fetching journal templates:', error);
        throw error;
      }

      return (data || []).map(f => ({
        id: f.name, // using name as ID since frameworks lacks ID
        name: f.name,
        profile_id: f.profile_id || undefined,
        content: f.content,
        cover_image: f.cover_image,
        category: f.category,
        description: f.description,
        is_pinned: f.is_pinned
      }));
    } catch (error) {
      console.error('Error in getTemplatesByUserId:', error);
      throw error;
    }
  }

  /**
   * Get a specific template by name for a user
   * @param userId The user ID
   * @param templateName The template name
   * @returns Promise with the template or null if not found
   */
  async getTemplateByName(userId: string, templateName: string): Promise<JournalTemplate | null> {
    try {
      const supabase = createSupabaseClient();

      const { data, error } = await supabase
        .from('frameworks')
        .select('profile_id, name, content, cover_image, category, description, is_pinned')
        .eq('profile_id', userId)
        .eq('name', decodeURIComponent(templateName))
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return null;
        }
        console.error('Error fetching journal template by name:', error);
        throw error;
      }

      return {
        id: data.name,
        name: data.name,
        profile_id: data.profile_id || undefined,
        content: data.content,
        cover_image: data.cover_image,
        category: data.category,
        description: data.description,
        is_pinned: data.is_pinned
      };
    } catch (error) {
      console.error('Error in getTemplateByName:', error);
      throw error;
    }
  }

  /**
   * Get default templates available to all users
   * @returns Promise with default templates
   */
  async getDefaultTemplates(): Promise<JournalTemplate[]> {
    try {
      const supabase = createSupabaseClient();

      // Assuming default templates identify by is_default=true OR specific categories if is_default missing
      // Based on schema, frameworks has is_default.
      const { data, error } = await supabase
        .from('frameworks')
        .select('name, content, category, is_default, description, cover_image')
        .eq('is_default', true)
        .order('name');

      if (error) {
        console.error('Error fetching default journal templates:', error);
        throw error;
      }

      return (data || []).map(template => ({
        profile_id: '',
        name: template.name,
        content: template.content || '',
        cover_image: template.cover_image,
        id: template.name,
        category: template.category,
        description: template.description,
        is_default: template.is_default
      }));
    } catch (error) {
      console.error('Error in getDefaultTemplates:', error);
      throw error;
    }
  }

  /**
   * Fetch all available journal templates
   * @returns Promise with all templates
   */
  async getAllTemplates(): Promise<JournalTemplate[]> {
    try {
      const supabase = createSupabaseClient();

      const { data, error } = await supabase
        .from('frameworks')
        .select('profile_id, name, content, cover_image, category, description, is_pinned')
        .order('name');

      if (error) {
        console.error('Error fetching all journal templates:', error);
        throw error;
      }

      return (data || []).map(f => ({
        id: f.name,
        name: f.name,
        profile_id: f.profile_id || undefined,
        content: f.content,
        cover_image: f.cover_image,
        category: f.category,
        description: f.description,
        is_pinned: f.is_pinned
      }));
    } catch (error) {
      console.error('Error in getAllTemplates:', error);
      throw error;
    }
  }
}

export const journalTemplateService = new JournalTemplateService();