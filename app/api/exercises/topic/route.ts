import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/utils/api-helpers';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateUser();

    const { english_level, topic_name } = await request.json();

    if (!english_level || !topic_name) {
      return NextResponse.json(
        { error: 'english_level and topic_name are required' },
        { status: 400 }
      );
    }

    // Call the external webhook
    const webhookUrl = 'https://n8n.elyandas.com/webhook/exercise_topic';
    
    console.log('Calling exercise topic webhook:', {
      english_level,
      topic_name,
    });

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        english_level,
        topic_name,
      }),
    });

    console.log('Webhook response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Webhook error response:', errorText);
      return NextResponse.json(
        { error: `Webhook failed: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}` },
        { status: response.status }
      );
    }

    const responseText = await response.text();
    console.log('Webhook response text:', responseText);

    let webhookResponse;
    try {
      webhookResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse webhook response as JSON:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON response from webhook' },
        { status: 500 }
      );
    }

    // Return the webhook response
    return NextResponse.json(webhookResponse);

  } catch (error) {
    console.error('Error calling exercise topic webhook:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get exercise topic' },
      { status: 500 }
    );
  }
}