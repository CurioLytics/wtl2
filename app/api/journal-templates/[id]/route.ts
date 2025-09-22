import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { JournalTemplate, JournalTemplateCategory, TEMPLATE_CATEGORIES } from '@/types/journal';
import { SUPABASE_CONFIG } from '@/config/supabase';

/**
 * GET /api/journal-template/:id
 * Returns a specific journal template by ID
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Create Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch specific template
    const { data, error } = await supabase
      .from(SUPABASE_CONFIG.tables.templates)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      }
      console.error(`Error fetching journal template ${id}:`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Map to JournalTemplate type according to SRS.md schema
    const template: JournalTemplate = {
      id: data.id,
      name: data.name,
      other: data.other || '',
      content: data.content || '',
      category: data.category && TEMPLATE_CATEGORIES.includes(data.category as JournalTemplateCategory) 
        ? (data.category as JournalTemplateCategory)
        : undefined,
      tag: Array.isArray(data.tag) ? data.tag : []
    };

    return NextResponse.json(template);
  } catch (error) {
    console.error('Unexpected error in journal template API:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}