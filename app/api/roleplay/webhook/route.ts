import { NextResponse } from 'next/server';
import { authenticateUser, getUserPreferences } from '@/utils/api-helpers';

// The actual webhook URL - kept on server side to prevent exposure
// Using environment variable for webhook URL
const WEBHOOK_URL = process.env.GET_ROLEPLAY_RESPONSE_WEBHOOK_URL;

/**
 * API proxy for the roleplay webhook to avoid CORS issues
 * Acts as a middleman between the frontend and the external webhook
 */
export async function POST(request: Request) {
  if (!WEBHOOK_URL) {
    console.error('GET_ROLEPLAY_RESPONSE_WEBHOOK_URL is not defined');
    return NextResponse.json(
      { error: 'Service configuration error' },
      { status: 500 }
    );
  }

  try {
    // Authenticate user and get preferences
    const user = await authenticateUser();
    const userPreferences = await getUserPreferences(user.id);

    // Get the JSON body from the request
    const body = await request.json();

    // Validate the request body for new body.query structure
    if (!body.body?.query || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request format. body.query and messages array are required.' },
        { status: 400 }
      );
    }

    const { query } = body.body;

    // Check if this is a subsequent request (has key) or first request (has all fields)
    const isSubsequentRequest = query.key && !query.title;

    // Validate required fields for first request only
    if (!isSubsequentRequest && (!query.title || !query.level || !query.ai_role || !('partner_prompt' in query))) {
      return NextResponse.json(
        { error: 'Invalid query format. For first request: title, level, ai_role, and partner_prompt are required. For subsequent requests: key is required.' },
        { status: 400 }
      );
    }

    // Validate key is present for subsequent requests
    if (isSubsequentRequest && !query.key) {
      return NextResponse.json(
        { error: 'Invalid query format. key is required for subsequent requests.' },
        { status: 400 }
      );
    }

    // Extract request ID from headers or generate a new one
    const requestId = request.headers.get('X-Request-ID') ||
      `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    console.log(`[${requestId}] Proxying request to webhook:`, requestId);

    // Set up timeout for the webhook request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout

    // Validate and log the payload structure for debugging
    console.log(`[${requestId}] Received payload structure:`, {
      query: {
        title: query.title,
        level: query.level,
        ai_role: query.ai_role,
        partner_prompt: query.partner_prompt ? 'present' : 'missing'
      },
      message_count: body.messages.length
    });

    // Since we're passing structured data that shouldn't be flattened into URL parameters,
    // we'll need to either maintain the POST approach or encode the whole payload

    // For GET requests, create a properly structured query with the body.query format
    const formattedQuery = {
      body: {
        query: {
          title: query.title,
          level: query.level,
          ai_role: query.ai_role,
          partner_prompt: query.partner_prompt
        }
      },
      messages: body.messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      }))
    };

    // Encode the entire structured payload as a single parameter
    const params = new URLSearchParams();
    params.append('payload', JSON.stringify(formattedQuery));

    // Build the URL with query parameters
    const urlWithParams = `${WEBHOOK_URL}?${params.toString()}`;

    // Log the full URL we're about to request (useful for debugging)
    console.log(`[${requestId}] Requesting webhook URL: ${urlWithParams}`);

    // Always use POST for the webhook API
    let response;

    // Try POST with the proper JSON structure
    try {
      console.log(`[${requestId}] Sending POST request to webhook`);

      // Format the payload according to the required structure with body.query format
      const formattedPayload: any = {
        body: {
          convoId: body.body.convoId, // Forward the convoId from client
          query: {
            key: query.key, // Forward the key from client
          }
        },
        messages: body.messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content
        }))
      };

      // Only include full context for first request
      if (!isSubsequentRequest) {
        formattedPayload.body.query.user = {
          name: userPreferences.name,
          english_level: userPreferences.english_level,
          style: userPreferences.style,
        };
        formattedPayload.body.query.title = query.title;
        formattedPayload.body.query.level = query.level;
        formattedPayload.body.query.ai_role = query.ai_role;
        formattedPayload.body.query.partner_prompt = query.partner_prompt;
        formattedPayload.body.query.session_id = query.session_id;
      }

      console.log(`[${requestId}] Formatted payload:`, formattedPayload);

      response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
          'X-Forwarded-By': 'w2l-api-proxy',
          'Accept': 'application/json, text/plain, */*'
        },
        body: JSON.stringify(formattedPayload),
        signal: controller.signal,
        cache: 'no-store'
      });
    } catch (error) {
      console.error(`[${requestId}] POST request failed:`, error);

      // If POST fails completely, return a useful error
      return NextResponse.json(
        {
          error: 'Failed to connect to webhook service',
          message: 'The roleplay service is currently unavailable. Please try again later.'
        },
        { status: 500 }
      );
    }

    // Log the response status and headers for debugging
    console.log(`[${requestId}] Webhook response status: ${response.status}`);
    console.log(`[${requestId}] Webhook response headers:`, Object.fromEntries([...response.headers.entries()]));

    clearTimeout(timeoutId);

    // Get the response text first to log it
    const responseText = await response.text();
    console.log(`[${requestId}] Webhook response received:`, responseText);

    // Handle empty responses
    if (!responseText || responseText.trim() === '') {
      console.warn(`[${requestId}] Empty response received from webhook`);
      return NextResponse.json(
        {
          response: "I'm here to help with your conversation. What would you like to discuss?",
          warning: "Empty response from webhook"
        },
        { status: 200 }
      );
    }

    try {
      // Try to parse the response as JSON
      const data = JSON.parse(responseText);

      // Check if message or response contains a stringified JSON (double-encoded)
      const stringField = data.message || data.response;
      if (stringField && typeof stringField === 'string') {
        try {
          const nestedData = JSON.parse(stringField);
          if (nestedData.response) {
            // Successfully parsed nested JSON with new structure
            return NextResponse.json(
              { 
                response: nestedData.response,
                suggested_answer: nestedData.suggested_answer
              },
              { status: response.status }
            );
          }
        } catch (e) {
          // If parsing nested JSON fails, treat as plain text
          return NextResponse.json(
            { response: stringField },
            { status: response.status }
          );
        }
      }

      // Check for direct response structure
      if (data.response) {
        // Check if data.response is itself an object with nested response
        if (typeof data.response === 'object' && data.response.response) {
          return NextResponse.json(
            { 
              response: data.response.response,
              suggested_answer: data.response.suggested_answer
            },
            { status: response.status }
          );
        }
        
        // Otherwise, use data.response directly as the response string
        return NextResponse.json(
          { 
            response: data.response,
            suggested_answer: data.suggested_answer
          },
          { status: response.status }
        );
      } else if (data.output) {
        return NextResponse.json(
          { response: data.output },
          { status: response.status }
        );
      } else if (data.message) {
        return NextResponse.json(
          { response: data.message },
          { status: response.status }
        );
      } else if (response.ok) {
        console.error(`[${requestId}] Invalid response format received:`, data);
        return NextResponse.json(
          {
            response: "I'm sorry, I couldn't generate a proper response at this time. Please try again.",
            error: "Invalid response format"
          },
          { status: 200 }
        );
      }

      return NextResponse.json(data, { status: response.status });
    } catch (jsonError) {
      // Handle non-JSON responses
      console.error(`[${requestId}] Failed to parse JSON response:`, jsonError);

      // If response is not JSON but status is OK, try to extract useful content
      if (response.ok) {
        // Return the raw text as the response if we can't parse JSON
        return NextResponse.json(
          { response: responseText || "Response received but couldn't be processed." },
          { status: 200 }
        );
      } else {
        // Return error for non-OK responses
        return NextResponse.json(
          {
            error: `Webhook returned status ${response.status}`,
            details: responseText
          },
          { status: response.status }
        );
      }
    }
  } catch (error) {
    console.error('Webhook proxy error:', error);

    // Handle different types of errors
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timed out' },
          { status: 504 } // Gateway Timeout
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}