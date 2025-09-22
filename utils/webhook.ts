const WEBHOOK_URL = 'https://auto.zephyrastyle.com/webhook/7b4775eb-8a92-4669-8c42-56e5fcb1017b';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function sendWebhook(data: any) {
  let lastError;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    console.log(`Sending webhook data (attempt ${attempt}/${MAX_RETRIES}):`, data);
    
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/plain, */*'
        },
        body: JSON.stringify(data),
      });

      console.log(`Webhook response status (attempt ${attempt}):`, response.status);
      
      // Consider any 2xx status code as success
      if (response.status >= 200 && response.status < 300) {
        return { success: true, status: response.status };
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
  return { success: false, error: lastError };
}