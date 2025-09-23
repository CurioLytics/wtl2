# Markdown Editor Documentation

## Overview
This documentation covers the implementation of a markdown editor for the journal writing area, which allows users to format text using markdown syntax. The editor includes a formatting toolbar with various formatting options and supports real-time rendering of markdown syntax.

## Components

### Legacy MarkdownEditor (Deprecated)
The original component that provides markdown editing capabilities with formatting options and preview mode.

**Props:**
- `value: string` - The markdown content to edit
- `onChange: (value: string) => void` - Callback function when content changes
- `placeholder?: string` - Optional placeholder text for the editor (default: "Start writing...")
- `minHeight?: number` - Optional minimum height for the editor (default: 300px)

### LiveMarkdownEditor (New Implementation)
A TipTap-based rich text editor with real-time markdown rendering capabilities.

**Props:**
- `value: string` - The markdown content to edit
- `onChange: (value: string) => void` - Callback function when content changes
- `placeholder?: string` - Optional placeholder text for the editor (default: "Start writing...")
- `minHeight?: number` - Optional minimum height for the editor (default: 300px)

**Features:**
- Toggle between edit and preview modes
- Real-time markdown rendering while typing
- Format text using the FormatToolbar component
- Built-in markdown shortcuts
- Support for task lists, code blocks, and highlights
- Automatic conversion between HTML and Markdown

### FormatToolbar
A toolbar component that provides formatting options for the LiveMarkdownEditor.

**Props:**
- `editor: Editor | null` - The TipTap editor instance

**Features:**
- Always-visible formatting buttons for common actions (Bold, Italic)
- Dropdown menu for additional formatting options
- Visual feedback for active formatting options
- Responsive design for mobile and desktop

## Utilities

### markdown-utils.ts
A utility module for working with markdown content (used by legacy MarkdownEditor).

**Functions:**
- `markdownToHtml(markdownText: string): string` - Converts markdown text to HTML
- `containsMarkdown(text: string): boolean` - Checks if text contains markdown syntax
- `stripMarkdown(markdownText: string): string` - Removes markdown formatting from text

### editor-utils.ts
A utility module for working with HTML and Markdown conversion in the LiveMarkdownEditor.

**Functions:**
- `htmlToMarkdown(html: string): string` - Converts HTML content to Markdown using Turndown
- `markdownToHtml(markdown: string): string` - Converts Markdown to HTML using Marked
- `sanitizeHtml(html: string): string` - Sanitizes HTML content (placeholder for future implementation)

## Usage Example (Legacy)
```tsx
import { useState } from 'react';
import { MarkdownEditor } from '@/components/journal/markdown-editor';

export default function JournalPage() {
  const [content, setContent] = useState('');
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Journal Entry</h1>
      
      <MarkdownEditor
        value={content}
        onChange={setContent}
        placeholder="Write your thoughts..."
        minHeight={400}
      />
      
      <div className="mt-4">
        <button className="px-4 py-2 bg-primary text-white rounded">
          Save
        </button>
      </div>
    </div>
  );
}
```

## Usage Example (New TipTap Implementation)
```tsx
import { useState } from 'react';
import { LiveMarkdownEditor } from '@/components/journal/live-markdown-editor';

export default function JournalPage() {
  const [content, setContent] = useState('');
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Journal Entry</h1>
      
      <LiveMarkdownEditor
        value={content}
        onChange={setContent}
        placeholder="Write your thoughts..."
        minHeight={400}
      />
      
      <div className="mt-4">
        <button className="px-4 py-2 bg-primary text-white rounded">
          Save
        </button>
      </div>
    </div>
  );
}
```

## Supported Markdown Formatting & Shortcuts
The LiveMarkdownEditor supports the following markdown syntax with live rendering:

| Markdown Syntax | Result | TipTap Shortcut |
|----------------|--------|----------------|
| `**text**` or `__text__` | **Bold text** | Type `**` before and after text |
| `*text*` or `_text_` | *Italic text* | Type `*` before and after text |
| `==text==` | ==Highlighted text== | Type `==` before and after text |
| `# Heading` | # Heading 1 | Type `# ` at the start of a line |
| `## Heading` | ## Heading 2 | Type `## ` at the start of a line |
| `### Heading` | ### Heading 3 | Type `### ` at the start of a line |
| `> text` | Blockquote | Type `> ` at the start of a line |
| ``` `code` ``` | `Inline code` | Type ``` ` ``` before and after text |
| ` ```code``` ` | Code block | Type ` ``` ` on a separate line, add code, then ` ``` ` |
| `- item` or `* item` | Bullet list | Type `- ` or `* ` at the start of a line |
| `1. item` | Numbered list | Type `1. ` at the start of a line |
| `[ ] task` | Unchecked task | Type `[ ] ` at the start of a line |
| `[x] task` | Checked task | Type `[x] ` at the start of a line |

## Implementation Notes

### TipTap Extensions
The LiveMarkdownEditor uses the following TipTap extensions:
- `StarterKit`: Base extensions including headings, lists, code blocks, etc.
- `Placeholder`: Shows placeholder text when the editor is empty
- `TaskList` & `TaskItem`: Support for interactive task lists with checkboxes
- `Highlight`: Support for highlighted text with the `==text==` syntax
- `Typography`: Smart typography features like smart quotes
- `CodeBlockLowlight`: Code blocks with syntax highlighting

### HTML/Markdown Conversion
- Uses `marked` library to convert Markdown to HTML
- Uses `turndown` library to convert HTML to Markdown
- Maintains content integrity between edit and preview modes

### CSS Styling
- CSS styling is done using CSS modules:
  - `live-markdown-editor.module.css` for the main editor
  - `format-toolbar.module.css` for the formatting toolbar

### Component Architecture
- `LiveMarkdownEditor`: Main component that manages the editor state
- `FormatToolbar`: Provides formatting options with button and dropdown UI
- Conversion utilities in `editor-utils.ts` for HTML/Markdown transformation

### Testing
- Unit tests for both LiveMarkdownEditor and FormatToolbar components
- Mocked TipTap editor for testing formatting features
- Testing renders, interactions, and state changes

### Template Integration
- Support for loading template content
- Preview editing of templates with custom content
- Markdown formatting is preserved when templates are loaded