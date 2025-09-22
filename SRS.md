## Table: journal_template

Stores journaling prompts with metadata for categorization.

### Columns
- `id` (`uuid`): Unique identifier
- `content` (`text`): Prompt text
- `tag` (`text[]`): Related tags
- `category` (`text`): Prompt category



# Webhooks and Apis

**User Signup**  
Type: Supabase API  
Input: { email, password, name }  
Output: { userId, email, created_at }  

**User Login**  
Type: Supabase API  
Input: { email, password }  
Output: { userId, jwt, session }  

**User Logout**  
Type: Supabase API  
Input: { userId }  
Output: { success: true }  

**Verify Email**  
Type: Supabase API  
Input: { token }  
Output: { success: true }  

**Create Journal Entry**  
Type: n8n Webhook  
Input: { userId, title, content, tags, category }  
Output: { entryId, created_at }  

**Update Journal Entry**  
Type: n8n Webhook  
Input: { entryId, content, tags, category }  
Output: { success: true }  

**Delete Journal Entry**  
Type: n8n Webhook  
Input: { entryId }  
Output: { success: true }  

**List Journal Entries**  
Type: Supabase API  
Input: { userId, filters? }  
Output: [{ entryId, title, content, tags, category, created_at }]  

**Fetch Journal Templates**  
Type: Supabase API  
Input: { templateId? }  
Output: [{ templateId, name, content, tags, category }]  

**Add Vocabulary**  
Type: n8n Webhook  
Input: { userId, word, meaning, example }  
Output: { vocabId, created_at }  

**List Vocabulary**  
Type: Supabase API  
Input: { userId, filter? }  
Output: [{ vocabId, word, meaning, example, created_at }]  

**Update Vocabulary**  
Type: n8n Webhook  
Input: { entryId, word, meaning, example }  
Output: { success: true }  

**Delete Vocabulary**  
Type: n8n Webhook  
Input: { entryId }  
Output: { success: true }  

**Start Roleplay Session**  
Type: n8n Webhook  
Input: { userId, scenarioId }  
Output: { sessionId, scenario, created_at }  

**Submit Roleplay Response**  
Type: n8n Webhook  
Input: { sessionId, response }  
Output: { success: true, feedback? }  

**Fetch Roleplay History**  
Type: Supabase API  
Input: { userId }  
Output: [{ sessionId, scenario, response, score, created_at }]  

**Onboarding Step**  
Type: n8n Webhook  
Input: { userId, stepId, data }  
Output: { success: true }  

**Complete Onboarding**  
Type: n8n Webhook  
Input: { userId }  
Output: { success: true, completed_at }  

**Fetch Dashboard Summary**  
Type: Supabase API  
Input: { userId }  
Output: { journals_count, vocab_count, roleplay_count }  

**Fetch Dashboard Progress**  
Type: Supabase API  
Input: { userId }  
Output: { journal_progress, vocab_progress, roleplay_progress }  

**Send Notification / Reminder**  
Type: n8n Webhook  
Input: { userId, message, type }  
Output: { success: true, sent_at }  
