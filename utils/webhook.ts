const WEBHOOK_URL = 'https://auto.zephyrastyle.com/webhook/7b4775eb-8a92-4669-8c42-56e5fcb1017b';
const MAX_RETRIES = 1; // Reduced from 3 to 1 to avoid multiple identical requests
const RETRY_DELAY = 1000; // 1 second
const WEBHOOK_CACHE = new Map<string, { result: any, timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 1 minute

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Generate a cache key from webhook data
function getCacheKey(data: any): string {
  // Create a simplified version of the data for caching
  const keyData = {
    userId: data.userId,
    email: data.email,
    timestamp: data.timestamp ? data.timestamp.split('T')[0] : undefined // Just use the date part
  };
  return JSON.stringify(keyData);
}

export async function sendWebhook(data: any) {
  // Check if we have a recent cached result for this data
  const cacheKey = getCacheKey(data);
  const cachedResult = WEBHOOK_CACHE.get(cacheKey);
  
  if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_TTL) {
    console.log('Using cached webhook result for:', cacheKey);
    return cachedResult.result;
  }
  
  let lastError;
  let result;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    console.log(`Sending webhook data (attempt ${attempt}/${MAX_RETRIES}):`, data);
    
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/plain, */*',
          // Add idempotency key to prevent duplicate processing
          'X-Idempotency-Key': `${data.userId}-${data.timestamp || Date.now()}`
        },
        body: JSON.stringify(data),
      });

      console.log(`Webhook response status (attempt ${attempt}):`, response.status);
      
      // Consider any 2xx status code as success
      if (response.status >= 200 && response.status < 300) {
        result = { success: true, status: response.status };
        // Cache successful result
        WEBHOOK_CACHE.set(cacheKey, { 
          result,
          timestamp: Date.now() 
        });
        return result;
      }

      lastError = `Webhook failed with status ${response.status}`;
      
      // If this wasn't our last attempt, wait before retrying
      if (attempt < MAX_RETRIES) {
        console.log(`Retrying in ${RETRY_DELAY}ms...`);
        await delay(RETRY_DELAY * attempt); // Exponential backoff
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Unknown error';
      
      if (attempt < MAX_RETRIES) {
        console.log(`Retrying in ${RETRY_DELAY}ms...`);
        await delay(RETRY_DELAY * attempt);
      }
    }
  }

  console.error('All webhook attempts failed. Last error:', lastError);
  result = { success: false, error: lastError };
  
  // Cache failed result too to prevent hammering the endpoint
  WEBHOOK_CACHE.set(cacheKey, { 
    result,
    timestamp: Date.now() 
  });
  
  return result;
}