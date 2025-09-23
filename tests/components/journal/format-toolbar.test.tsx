import { render, screen, fireEvent } from '@testing-library/react';
import { FormatToolbar } from '../../../components/journal/format-toolbar';
import '@testing-library/jest-dom';

// Mock editor
const createMockEditor = (options = {}) => {
  return {
    isActive: jest.fn().mockReturnValue(false),
    chain: () => ({
      focus: () => ({
        toggleBold: () => ({ run: jest.fn() }),
        toggleItalic: () => ({ run: jest.fn() }),
        toggleHeading: () => ({ run: jest.fn() }),
        toggleBulletList: () => ({ run: jest.fn() }),
        toggleOrderedList: () => ({ run: jest.fn() }),
        toggleTaskList: () => ({ run: jest.fn() }),
        toggleHighlight: () => ({ run: jest.fn() }),
        toggleCodeBlock: () => ({ run: jest.fn() }),
        toggleBlockquote: () => ({ run: jest.fn() }),
      }),
    }),
    can: () => true,
    ...options,
  };
};

describe('FormatToolbar', () => {
  it('renders basic formatting options', () => {
    const mockEditor = createMockEditor();
    render(<FormatToolbar editor={mockEditor} />);

    expect(screen.getByLabelText(/bold/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/italic/i)).toBeInTheDocument();
  });

  it('renders dropdown formatting options', () => {
    const mockEditor = createMockEditor();
    render(<FormatToolbar editor={mockEditor} />);

    // Open the dropdown
    fireEvent.click(screen.getByLabelText(/more formatting/i));

    // Check dropdown items
    expect(screen.getByText(/heading/i)).toBeInTheDocument();
    expect(screen.getByText(/bullet list/i)).toBeInTheDocument();
    expect(screen.getByText(/numbered list/i)).toBeInTheDocument();
    expect(screen.getByText(/task list/i)).toBeInTheDocument();
    expect(screen.getByText(/highlight/i)).toBeInTheDocument();
    expect(screen.getByText(/code block/i)).toBeInTheDocument();
    expect(screen.getByText(/quote/i)).toBeInTheDocument();
  });

  it('disables buttons when editor is not available', () => {
    render(<FormatToolbar editor={null} />);
    
    expect(screen.getByLabelText(/bold/i)).toBeDisabled();
    expect(screen.getByLabelText(/italic/i)).toBeDisabled();
    expect(screen.getByLabelText(/more formatting/i)).toBeDisabled();
  });

  it('highlights active formatting options', () => {
    const mockEditor = createMockEditor({
      isActive: (type) => type === 'bold',
    });
    
    render(<FormatToolbar editor={mockEditor} />);
    
    // Bold button should have active styling
    expect(screen.getByLabelText(/bold/i)).toHaveClass('bg-gray-200');
    
    // Italic button should not have active styling
    expect(screen.getByLabelText(/italic/i)).not.toHaveClass('bg-gray-200');
  });
});