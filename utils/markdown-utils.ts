import MarkdownIt from 'markdown-it';
import markdownItTaskLists from 'markdown-it-task-lists';

// Create a singleton instance of markdown-it with our configuration
const md = new MarkdownIt({
  breaks: true,        // Convert '\n' to <br>
  linkify: true,       // Auto-convert URLs to links
  typographer: true,   // Enable smartquotes and other typographic replacements
})
.use(markdownItTaskLists); // Add task lists support (- [ ] and - [x])

/**
 * Convert markdown text to HTML
 * 
 * @param markdownText The markdown text to convert
 * @returns The HTML string
 */
export function markdownToHtml(markdownText: string): string {
  if (!markdownText) return '';
  return md.render(markdownText);
}

/**
 * Check if a string contains markdown syntax
 * 
 * @param text The text to check
 * @returns True if the text contains markdown syntax, false otherwise
 */
export function containsMarkdown(text: string): boolean {
  if (!text) return false;
  
  // Common markdown patterns
  const markdownPatterns = [
    /#{1,6}\s+.+/,                // Headers
    /\*\*.+\*\*/,                 // Bold
    /\*.+\*/,                     // Italic
    /!\[.+\]\(.+\)/,              // Images
    /\[.+\]\(.+\)/,               // Links
    /^\s*[-*+]\s+.+/m,            // Unordered lists
    /^\s*\d+\.\s+.+/m,            // Ordered lists
    /^\s*>\s+.+/m,                // Blockquotes
    /`[^`]+`/,                    // Inline code
    /```[\s\S]*?```/,             // Code blocks
    /==.+==/,                     // Highlights
    /- \[ \]/,                    // Task list (unchecked)
    /- \[x\]/i                    // Task list (checked)
  ];
  
  return markdownPatterns.some(pattern => pattern.test(text));
}

/**
 * Extract plain text from markdown
 * 
 * @param markdownText The markdown text to extract plain text from
 * @returns The plain text without markdown formatting
 */
export function stripMarkdown(markdownText: string): string {
  if (!markdownText) return '';
  
  // This is a simplified version - for more complete stripping, 
  // consider using a dedicated library
  return markdownText
    .replace(/#{1,6}\s+/g, '')              // Headers
    .replace(/\*\*(.+?)\*\*/g, '$1')        // Bold
    .replace(/\*(.+?)\*/g, '$1')            // Italic
    .replace(/!\[(.+?)\]\(.+?\)/g, '$1')    // Images
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')     // Links
    .replace(/^\s*[-*+]\s+/gm, '')          // Unordered lists
    .replace(/^\s*\d+\.\s+/gm, '')          // Ordered lists
    .replace(/^\s*>\s+/gm, '')              // Blockquotes
    .replace(/`([^`]+)`/g, '$1')            // Inline code
    .replace(/```[\s\S]*?```/g, '')         // Code blocks
    .replace(/==(.+?)==/g, '$1')            // Highlights
    .replace(/- \[ \]\s*/g, '')             // Task list (unchecked)
    .replace(/- \[x\]\s*/gi, '');           // Task list (checked)
}