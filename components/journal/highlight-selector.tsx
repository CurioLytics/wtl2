'use client';

import { useEffect } from 'react';

interface HighlightSelectorProps {
  containerId: string;
  onHighlightSaved: (text: string) => void;
}

export const HighlightSelector: React.FC<HighlightSelectorProps> = ({
  containerId,
  onHighlightSaved,
}) => {
  useEffect(() => {
    // Track current save button
    let saveButton: HTMLElement | null = null;
    let selectedRange: Range | null = null;

    // Function to remove save button if it exists
    const removeSaveButton = () => {
      if (saveButton && document.body.contains(saveButton)) {
        document.body.removeChild(saveButton);
        saveButton = null;
      }
    };

    // Create and show the save button
    const showSaveButton = (x: number, y: number, text: string, range: Range) => {
      // Remove existing button if any
      removeSaveButton();

      // Create new button
      saveButton = document.createElement('div');
      saveButton.style.position = 'absolute';
      saveButton.style.left = `${x}px`;
      saveButton.style.top = `${y}px`;
      saveButton.style.transform = 'translateX(-50%)';
      saveButton.style.zIndex = '9999';
      saveButton.style.backgroundColor = '#FFCC00';
      saveButton.style.color = '#000000';
      saveButton.style.padding = '4px 12px';
      saveButton.style.borderRadius = '4px';
      saveButton.style.cursor = 'pointer';
      saveButton.style.fontWeight = 'bold';
      saveButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      saveButton.style.border = '2px solid #FF9900';
      saveButton.textContent = 'Save';
      
      // Position in viewport
      document.body.appendChild(saveButton);
      
      // Log for debugging
      console.log('Save button created and added to DOM');
      console.log('Button position:', x, y);
      
      // Store the range
      selectedRange = range.cloneRange();

      // Handle click
      saveButton.addEventListener('click', () => {
        if (selectedRange) {
          try {
            console.log('Highlighting text:', text);
            console.log('Range:', selectedRange);
            
            // Save the text first
            onHighlightSaved(text);
            console.log('onHighlightSaved called with:', text);
            
            // For more reliable highlighting, create a text node for selection
            // and wrap it in a span with yellow background
            const container = document.getElementById(containerId);
            if (container) {
              // Find the text nodes that contain the selected text
              const walker = document.createTreeWalker(
                container,
                NodeFilter.SHOW_TEXT,
                null
              );
              
              let currentNode;
              const textContent = container.textContent || '';
              const startIndex = textContent.indexOf(text);
              
              if (startIndex !== -1) {
                // We know the text exists in the container
                // Let's manually highlight it with CSS
                const highlightedHTML = container.innerHTML.replace(
                  new RegExp(`(${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'g'),
                  '<span style="background-color: yellow;" class="highlighted-text">$1</span>'
                );
                container.innerHTML = highlightedHTML;
                console.log('Applied highlighting via innerHTML replacement');
              }
            }
            
            // Clean up
            removeSaveButton();
            window.getSelection()?.removeAllRanges();
          } catch (error) {
            console.error('Error highlighting text:', error);
            
            // Even if highlighting fails, still save the text
            onHighlightSaved(text);
            
            // Clean up
            removeSaveButton();
            window.getSelection()?.removeAllRanges();
          }
        }
      });
    };

    // Handle selection changes
    const handleSelection = () => {
      const selection = window.getSelection();
      
      // Check if we have a valid selection
      if (!selection || selection.rangeCount === 0 || selection.toString().trim() === '') {
        removeSaveButton();
        return;
      }
      
      const range = selection.getRangeAt(0);
      const text = selection.toString().trim();
      
      // Check if selection is in our container
      const container = document.getElementById(containerId);
      if (!container || !container.contains(range.commonAncestorContainer)) {
        removeSaveButton();
        return;
      }
      
      // Get position of selection
      const rect = range.getBoundingClientRect();
      
      // Position the button above the selection
      const x = rect.left + (rect.width / 2);
      const y = rect.top - 30 + window.scrollY;
      
      console.log('Selection detected:', text);
      console.log('Button position:', x, y);
      
      // Show the save button
      showSaveButton(x, y, text, range);
    };

    // Handle clicks outside the selection
    const handleDocumentClick = (e: MouseEvent) => {
      if (saveButton && !saveButton.contains(e.target as Node)) {
        const container = document.getElementById(containerId);
        
        // Don't remove if clicking inside container (might be creating a selection)
        if (!container || !container.contains(e.target as Node)) {
          removeSaveButton();
        }
      }
    };

    // Set up event listeners
    const container = document.getElementById(containerId);
    if (container) {
      console.log('Setting up highlight selector for container:', containerId);
      
      // Give it a moment to initialize
      setTimeout(() => {
        container.addEventListener('mouseup', handleSelection);
        document.addEventListener('mousedown', handleDocumentClick);
        
        // Also detect selection changes
        document.addEventListener('selectionchange', () => {
          // Use requestAnimationFrame to wait for selection to be complete
          requestAnimationFrame(handleSelection);
        });
      }, 100);
    }

    // Cleanup
    return () => {
      const container = document.getElementById(containerId);
      if (container) {
        container.removeEventListener('mouseup', handleSelection);
        document.removeEventListener('mousedown', handleDocumentClick);
        document.removeEventListener('selectionchange', () => {});
      }
      removeSaveButton();
    };
  }, [containerId, onHighlightSaved]);

  // No visual output from component itself
  return null;
};