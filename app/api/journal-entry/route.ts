import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * POST /api/journal
 * Creates a new journal entry
 */
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Parse request body
    const { title, content, templateId, entryDate } = await request.json();
    
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' }, 
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Validate date format if provided
    let parsedDate: string;
    try {
      // If entryDate is provided, use it; otherwise, use current date
      parsedDate = entryDate 
        ? new Date(entryDate).toISOString()
        : new Date().toISOString();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid date format' }, 
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Insert journal entry
    const { data, error } = await supabase
      .from('journals')
      .insert({
        user_id: user.id,
        title,
        content,
        template_id: templateId || null,
        created_at: parsedDate, // Use the validated date
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('Error creating journal entry:', error);
      return NextResponse.json(
        { error: error.message }, 
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Journal entry created successfully',
      id: data.id 
    },
    { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Unexpected error in journal API:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}