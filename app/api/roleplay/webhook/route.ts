import { NextResponse } from 'next/server';

// The actual webhook URL - kept on server side to prevent exposure
const WEBHOOK_URL = "https://auto2.elyandas.com/webhook/roleplay";

/**
 * API proxy for the roleplay webhook to avoid CORS issues
 * Acts as a middleman between the frontend and the external webhook
 */
export async function POST(request: Request) {
  try {
    // Get the JSON body from the request
    const body = await request.json();
    
    // Validate the request body for new nested query structure
    let requestData;
    
    if (body.query) {
      // Check if we received the query-wrapped format from the client
      if (!body.query.scenario_context?.scenario_context || 
          !body.query.convo_id || 
          !Array.isArray(body.query.messages) || 
          body.query.messages.length === 0) {
        return NextResponse.json(
          { error: 'Invalid request format. query.scenario_context, query.convo_id and query.messages are required.' },
          { status: 400 }
        );
      }
      // Use the query-wrapped body directly
      requestData = body.query;
    } else {
      // For backward compatibility, check the old structure
      if (!body.scenario_context?.scenario_context || 
          !body.convo_id || 
          !Array.isArray(body.messages) || 
          body.messages.length === 0) {
        return NextResponse.json(
          { error: 'Invalid request format. scenario_context, convo_id and messages are required.' },
          { status: 400 }
        );
      }
      requestData = body;
    }
    
    // Extract request ID from headers or generate a new one
    const requestId = request.headers.get('X-Request-ID') || 
                     `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    console.log(`[${requestId}] Proxying request to webhook:`, requestData);
    
    // Set up timeout for the webhook request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout
    
    // Validate and log the payload structure for debugging
    console.log(`[${requestId}] Received payload structure:`, {
      convo_id: requestData.convo_id,
      scenario_context: {
        title: requestData.scenario_context.title,
        difficulty: requestData.scenario_context.difficulty,
        context_length: requestData.scenario_context.scenario_context.length // Log length instead of full context
      },
      message_count: requestData.messages.length
    });
    
    // Since we're passing structured data that shouldn't be flattened into URL parameters,
    // we'll need to either maintain the POST approach or encode the whole payload
    
    // For GET requests, create a properly structured query with the nested format
    const formattedQuery = {
      query: {
        scenario_context: {
          scenario_context: requestData.scenario_context.scenario_context,
          title: requestData.scenario_context.title,
          difficulty: requestData.scenario_context.difficulty,
          role1: requestData.scenario_context.role1 || "" // Add role1 field
        },
        convo_id: requestData.convo_id,
        messages: requestData.messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content
        }))
      }
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
      
      // Format the payload according to the required structure with 'query' at the top level
      const formattedPayload = {
        query: {
          scenario_context: {
            scenario_context: requestData.scenario_context.scenario_context,
            title: requestData.scenario_context.title,
            difficulty: requestData.scenario_context.difficulty,
            role1: requestData.scenario_context.role1 || "" // Add role1 field
          },
          convo_id: requestData.convo_id,
          messages: requestData.messages.map((msg: any) => ({
            role: msg.role,
            content: msg.content
          }))
        }
      };
      
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
          message: "I'm here to help with your conversation. What would you like to discuss?",
          warning: "Empty response from webhook" 
        }, 
        { status: 200 }
      );
    }
    
    try {
      // Try to parse the response as JSON
      const data = JSON.parse(responseText);
      
      // Check for either 'message' or 'output' property
      if (data.output) {
        // Convert 'output' to 'message' format that our client expects
        return NextResponse.json(
          { message: data.output },
          { status: response.status }
        );
      } else if (data.message) {
        // Return response as is if it has a 'message' property
        return NextResponse.json(data, { status: response.status });
      } else if (response.ok) {
        // No recognized response format but status is OK
        console.error(`[${requestId}] Invalid response format received:`, data);
        return NextResponse.json(
          { 
            message: "I'm sorry, I couldn't generate a proper response at this time. Please try again.",
            error: "Invalid response format" 
          }, 
          { status: 200 }
        );
      }
      
      // Return the response with appropriate status for error cases
      return NextResponse.json(data, { status: response.status });
    } catch (jsonError) {
      // Handle non-JSON responses
      console.error(`[${requestId}] Failed to parse JSON response:`, jsonError);
      
      // If response is not JSON but status is OK, try to extract useful content
      if (response.ok) {
        // Return the raw text as the message if we can't parse JSON
        return NextResponse.json(
          { message: responseText || "Response received but couldn't be processed." },
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