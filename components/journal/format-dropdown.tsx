'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Bold, Italic, List, ListOrdered, Heading, Quote as QuoteIcon, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FormatOption {
  icon: React.ReactNode;
  label: string;
  action: string;
  shortcut?: string;
}

interface FormatOptionGroup {
  title?: string;
  options: FormatOption[];
}

interface FormatDropdownProps {
  onFormatClick: (action: string) => void;
}

export function FormatDropdown({ onFormatClick }: FormatDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Format options organized by groups
  const formatGroups: FormatOptionGroup[] = [
    {
      options: [
        {
          icon: <Bold size={16} />,
          label: 'Bold',
          action: 'bold',
          shortcut: '**text**'
        },
        {
          icon: <Italic size={16} />,
          label: 'Italic',
          action: 'italic',
          shortcut: '*text*'
        },
        {
          icon: <span className="text-xs w-4 h-4 flex items-center justify-center bg-yellow-200 rounded">H</span>,
          label: 'Highlight',
          action: 'highlight',
          shortcut: '==text=='
        }
      ]
    },
    {
      options: [
        {
          icon: <Heading size={16} />,
          label: 'Heading',
          action: 'heading',
          shortcut: '## text'
        },
        {
          icon: <QuoteIcon size={16} />,
          label: 'Quote',
          action: 'quote',
          shortcut: '> text'
        },
        {
          icon: <Code size={16} />,
          label: 'Inline Code',
          action: 'code',
          shortcut: '`code`'
        }
      ]
    },
    {
      options: [
        {
          icon: <List size={16} />,
          label: 'Bullet List',
          action: 'bullet-list',
          shortcut: '- item'
        },
        {
          icon: <ListOrdered size={16} />,
          label: 'Numbered List',
          action: 'numbered-list',
          shortcut: '1. item'
        },
        {
          icon: <span className="flex items-center justify-center w-4 h-4 border border-gray-400 rounded">
            <span className="w-2 h-2"></span>
          </span>,
          label: 'Task List',
          action: 'task-list',
          shortcut: '- [ ] task'
        }
      ]
    }
  ];
  
  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle format option click
  const handleFormatClick = (action: string) => {
    onFormatClick(action);
    // Note: We don't close the dropdown here to follow the requirement
    // that it should remain open until the user clicks the dropdown button again
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={toggleDropdown}
        className="flex items-center gap-1 text-gray-700"
      >
        <span>Format</span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1 divide-y divide-gray-100">
            {formatGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="px-1 py-1">
                {group.title && (
                  <div className="px-2 py-1 text-xs font-semibold text-gray-500">
                    {group.title}
                  </div>
                )}
                {group.options.map((option, optionIndex) => (
                  <button 
                    key={optionIndex}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => handleFormatClick(option.action)}
                  >
                    {option.icon}
                    <span>{option.label}</span>
                    {option.shortcut && (
                      <span className="ml-auto text-xs text-gray-500">{option.shortcut}</span>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}