import { marked } from 'marked';
import TurndownService from 'turndown';

// Initialize turndown service for HTML to Markdown conversion
const turndownService = new TurndownService({
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced'
});

/**
 * Converts HTML content to Markdown
 * @param html HTML content to convert
 * @returns Markdown string
 */
export function htmlToMarkdown(html: string): string {
  return turndownService.turndown(html);
}

/**
 * Converts Markdown content to HTML
 * @param markdown Markdown content to convert
 * @returns HTML string
 */
export function markdownToHtml(markdown: string): string {
  return marked.parse(markdown, { 
    breaks: true,
    gfm: true 
  }) as string;
}

/**
 * Sanitizes HTML content (if needed)
 * @param html HTML content to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string): string {
  // Implement HTML sanitization if needed
  // This is a placeholder for now
  return html;
}