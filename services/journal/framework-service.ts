import { createSupabaseClient } from '@/services/supabase/auth-helpers';

export interface FrameworkCategory {
  name: string;
  description: string | null;
  image_cover: string | null;
}

export interface Framework {
  name: string;
  content: string;
  description?: string | null;
  category: string;
  source?: string | null;
  is_pinned?: boolean;
  profile_id?: string | null;
}

class FrameworkService {
  /**
   * Get all framework categories
   */
  async getCategories(): Promise<FrameworkCategory[]> {
    try {
      const supabase = createSupabaseClient();

      const { data, error } = await supabase
        .from('framework_category')
        .select('name, description, image_cover')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching framework categories:', error);
      throw error;
    }
  }

  /**
   * Get all frameworks
   */
  async getFrameworks(): Promise<Framework[]> {
    try {
      const supabase = createSupabaseClient();

      const { data, error } = await supabase
        .from('frameworks')
        .select('name, content, description, category, source, is_pinned, profile_id')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching frameworks:', error);
      throw error;
    }
  }

  /**
   * Get frameworks by category
   */
  async getFrameworksByCategory(category: string): Promise<Framework[]> {
    try {
      const supabase = createSupabaseClient();

      const { data, error } = await supabase
        .from('frameworks')
        .select('name, content, description, category, source, is_pinned')
        .eq('category', category)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching frameworks by category:', error);
      throw error;
    }
  }

  /**
   * Get pinned frameworks for the current user (Custom category only)
   */
  async getPinnedFrameworks(): Promise<Framework[]> {
    try {
      const supabase = createSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return [];

      const { data, error } = await supabase
        .from('frameworks')
        .select('name, content, description, category, source, is_pinned, profile_id')
        .eq('is_pinned', true)
        .eq('category', 'Custom')
        .eq('profile_id', user.id)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching pinned frameworks:', error);
      throw error;
    }
  }

  /**
   * Create a new framework
   */
  async createFramework(framework: Omit<Framework, 'source'>): Promise<Framework> {
    try {
      const supabase = createSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('frameworks')
        .insert({
          name: framework.name,
          content: framework.content,
          description: framework.description,
          category: 'Custom',
          is_pinned: framework.is_pinned || false,
          profile_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating framework:', error);
      throw error;
    }
  }

  /**
   * Update an existing framework by name and profile_id
   */
  async updateFramework(originalName: string, updates: Partial<Framework>): Promise<Framework> {
    try {
      const supabase = createSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('User not authenticated');

      // Build update object, only including defined fields
      const updateData: any = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.content !== undefined) updateData.content = updates.content;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.is_pinned !== undefined) updateData.is_pinned = updates.is_pinned;

      const { data, error } = await supabase
        .from('frameworks')
        .update(updateData)
        .eq('name', originalName)
        .eq('profile_id', user.id)
        .select('name, content, description, category, source, is_pinned, profile_id')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating framework:', error);
      throw error;
    }
  }
}

export const frameworkService = new FrameworkService();