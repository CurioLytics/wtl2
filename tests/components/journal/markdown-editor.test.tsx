import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MarkdownEditor } from '@/components/journal/markdown-editor';
import { FormatDropdown } from '@/components/journal/format-dropdown';
import { markdownToHtml, containsMarkdown, stripMarkdown } from '@/utils/markdown-utils';

// Mock the dynamic import of the MDEditor component
jest.mock('next/dynamic', () => () => {
  const DynamicComponent = ({ value, onChange, textareaProps }) => (
    <textarea 
      data-testid="mock-md-editor" 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={textareaProps?.placeholder}
      ref={textareaProps?.ref}
    />
  );
  return DynamicComponent;
});

// Mock markdown-it
jest.mock('markdown-it', () => {
  return jest.fn().mockImplementation(() => {
    return {
      use: jest.fn().mockReturnThis(),
      render: jest.fn().mockImplementation((text) => {
        // Simple mock implementation
        return text
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.+?)\*/g, '<em>$1</em>')
          .replace(/##\s+(.+)/g, '<h2>$1</h2>')
          .replace(/- \[ \] (.+)/g, '<input type="checkbox"> $1')
          .replace(/- \[x\] (.+)/g, '<input type="checkbox" checked> $1')
          .replace(/==(.+?)==/g, '<mark>$1</mark>');
      })
    };
  });
});

describe('MarkdownEditor Component', () => {
  const onChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders in edit mode by default', () => {
    render(<MarkdownEditor value="Test content" onChange={onChange} />);
    
    expect(screen.getByTestId('mock-md-editor')).toBeInTheDocument();
    expect(screen.queryByText('Edit')).toBeNull();
    expect(screen.getByText('Preview')).toBeInTheDocument();
  });

  it('toggles between edit and preview mode', async () => {
    render(<MarkdownEditor value="**Bold text**" onChange={onChange} />);
    
    // Initially in edit mode
    expect(screen.getByTestId('mock-md-editor')).toBeInTheDocument();
    
    // Click preview button
    fireEvent.click(screen.getByText('Preview'));
    
    // Should show preview content
    await waitFor(() => {
      expect(screen.queryByTestId('mock-md-editor')).not.toBeInTheDocument();
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });
    
    // Click edit button
    fireEvent.click(screen.getByText('Edit'));
    
    // Should be back in edit mode
    await waitFor(() => {
      expect(screen.getByTestId('mock-md-editor')).toBeInTheDocument();
      expect(screen.getByText('Preview')).toBeInTheDocument();
    });
  });

  // More tests for MarkdownEditor
});

describe('FormatDropdown Component', () => {
  const onFormatClick = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders a closed dropdown by default', () => {
    render(<FormatDropdown onFormatClick={onFormatClick} />);
    
    expect(screen.getByText('Format')).toBeInTheDocument();
    expect(screen.queryByText('Bold')).not.toBeInTheDocument();
  });
  
  it('opens the dropdown when clicked', async () => {
    render(<FormatDropdown onFormatClick={onFormatClick} />);
    
    fireEvent.click(screen.getByText('Format'));
    
    await waitFor(() => {
      expect(screen.getByText('Bold')).toBeInTheDocument();
      expect(screen.getByText('Italic')).toBeInTheDocument();
      expect(screen.getByText('Highlight')).toBeInTheDocument();
    });
  });
  
  it('keeps dropdown open after option click', async () => {
    render(<FormatDropdown onFormatClick={onFormatClick} />);
    
    fireEvent.click(screen.getByText('Format'));
    await waitFor(() => {
      expect(screen.getByText('Bold')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Bold'));
    expect(onFormatClick).toHaveBeenCalledWith('bold');
    
    // Dropdown should still be open
    expect(screen.getByText('Bold')).toBeInTheDocument();
  });
  
  it('closes dropdown only when Format button is clicked again', async () => {
    render(<FormatDropdown onFormatClick={onFormatClick} />);
    
    fireEvent.click(screen.getByText('Format'));
    await waitFor(() => {
      expect(screen.getByText('Bold')).toBeInTheDocument();
    });
    
    // Click Format button again
    fireEvent.click(screen.getByText('Format'));
    await waitFor(() => {
      expect(screen.queryByText('Bold')).not.toBeInTheDocument();
    });
  });
});

describe('Markdown Utils', () => {
  describe('markdownToHtml', () => {
    it('converts markdown to HTML', () => {
      const markdown = '**Bold** and *italic* text';
      const html = markdownToHtml(markdown);
      
      expect(html).toContain('<strong>Bold</strong>');
      expect(html).toContain('<em>italic</em>');
    });
    
    it('returns empty string for null or undefined input', () => {
      expect(markdownToHtml('')).toBe('');
      expect(markdownToHtml(null)).toBe('');
      expect(markdownToHtml(undefined)).toBe('');
    });
  });
  
  describe('containsMarkdown', () => {
    it('detects markdown in text', () => {
      expect(containsMarkdown('**Bold**')).toBe(true);
      expect(containsMarkdown('Regular text')).toBe(false);
      expect(containsMarkdown('# Heading')).toBe(true);
      expect(containsMarkdown('- [ ] Task')).toBe(true);
    });
    
    it('returns false for null or undefined input', () => {
      expect(containsMarkdown('')).toBe(false);
      expect(containsMarkdown(null)).toBe(false);
      expect(containsMarkdown(undefined)).toBe(false);
    });
  });
  
  describe('stripMarkdown', () => {
    it('removes markdown formatting', () => {
      expect(stripMarkdown('**Bold**')).toBe('Bold');
      expect(stripMarkdown('# Heading')).toBe('Heading');
      expect(stripMarkdown('- [ ] Task')).toBe('Task');
    });
    
    it('returns empty string for null or undefined input', () => {
      expect(stripMarkdown('')).toBe('');
      expect(stripMarkdown(null)).toBe('');
      expect(stripMarkdown(undefined)).toBe('');
    });
  });
});