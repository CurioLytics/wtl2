import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SUPABASE_CONFIG } from '@/config/supabase';
import { JournalTemplate, JournalTemplateCategory, TEMPLATE_CATEGORIES } from '@/types/journal';

/**
 * GET /api/journal-template
 * Returns all journal templates, accessible to authenticated users
 */
export async function GET() {
  try {
    // Create Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch templates from journal_templates table
    const { data, error } = await supabase
      .from(SUPABASE_CONFIG.tables.templates)
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Error fetching journal templates:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Map to JournalTemplate type according to SRS.md schema
    const templates: JournalTemplate[] = data.map(template => ({
      id: template.id,
      name: template.name,
      other: template.other || '',
      content: template.content || '',
      category: template.category && TEMPLATE_CATEGORIES.includes(template.category as JournalTemplateCategory) 
        ? (template.category as JournalTemplateCategory)
        : undefined,
      tag: Array.isArray(template.tag) ? template.tag : []
    }));

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Unexpected error in journal templates API:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}