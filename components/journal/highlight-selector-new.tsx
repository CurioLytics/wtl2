'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useResponsive } from '@/hooks/common/use-responsive';
import { zIndex } from '@/utils/z-index';
import styles from './highlight-selector.module.css';

interface HighlightSelectorProps {
  containerId: string;
  onHighlightSaved: (text: string) => void;
  highlights: string[]; // Add the current highlights array from parent
}

export const HighlightSelector: React.FC<HighlightSelectorProps> = ({
  containerId,
  onHighlightSaved,
  highlights
}) => {
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const [selectedText, setSelectedText] = useState('');
  // Track which highlights are currently displayed in the DOM
  const highlightedTextRefs = useRef<Map<string, HTMLElement[]>>(new Map());
  // Get responsive state
  const { isMobile, isDesktop } = useResponsive();

  // Function to highlight text in the container
  const highlightTextInContainer = (text: string, container: HTMLElement) => {
    // Get all text nodes in the container
    const textNodes = getAllTextNodes(container);
    const refs: HTMLElement[] = [];
    
    for (const node of textNodes) {
      const nodeText = node.textContent || '';
      const index = nodeText.indexOf(text);
      
      if (index >= 0) {
        try {
          // Split the text node and insert a highlighted span
          const range = document.createRange();
          range.setStart(node, index);
          range.setEnd(node, index + text.length);
          
          const span = document.createElement('span');
          span.className = styles['highlighted-text'];
          
          range.surroundContents(span);
          refs.push(span);
          console.log('Text highlighted successfully:', text);
        } catch (error) {
          console.error('Error highlighting text:', error);
        }
      }
    }
    
    if (refs.length > 0) {
      // Store references to this highlight's DOM elements
      highlightedTextRefs.current.set(text, refs);
    }
  };
  
  // Get all text nodes in a container
  const getAllTextNodes = (element: Node): Text[] => {
    const textNodes: Text[] = [];
    
    const walk = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    let node;
    while ((node = walk.nextNode())) {
      textNodes.push(node as Text);
    }
    
    return textNodes;
  };

  // Synchronize highlights with DOM
  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Function to remove highlights that are not in the highlights array
    const removeUnwantedHighlights = () => {
      // Get all highlighted spans in the container
      const highlightedSpans = container.querySelectorAll(`.${styles['highlighted-text']}`);
      
      highlightedSpans.forEach(span => {
        const text = span.textContent;
        if (text && !highlights.includes(text)) {
          // This highlight is no longer in the array, remove the highlight styling
          const textNode = document.createTextNode(text);
          span.parentNode?.replaceChild(textNode, span);
        }
      });
    };
    
    // Function to add highlights that are in the array but not in the DOM
    const addMissingHighlights = () => {
      // Only process highlights not already tracked
      highlights.forEach(text => {
        if (text && !highlightedTextRefs.current.has(text)) {
          highlightTextInContainer(text, container);
        }
      });
    };
    
    removeUnwantedHighlights();
    addMissingHighlights();
    
  }, [highlights, containerId]);

  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container with id ${containerId} not found`);
      return;
    }

    console.log('Setting up highlight selector for container:', containerId);

    // Function to handle text selection
    const handleSelection = () => {
      const selection = window.getSelection();
      
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
        setIsButtonVisible(false);
        return;
      }
      
      const text = selection.toString().trim();
      if (!text) {
        setIsButtonVisible(false);
        return;
      }
      
      const range = selection.getRangeAt(0);
      
      // Check if selection is within our container
      if (!container.contains(range.commonAncestorContainer)) {
        setIsButtonVisible(false);
        return;
      }
      
      // Store selected text
      setSelectedText(text);
      
      // Calculate button position
      const rect = range.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      // Position the button - mobile-first approach
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Check if there's enough space below for the button
      const spaceBelow = viewportHeight - rect.bottom;
      const needsTopPosition = spaceBelow < 100;
      
      // Mobile-first positioning (default)
      let topPosition = needsTopPosition 
        ? rect.top - containerRect.top + window.scrollY - 60 
        : rect.bottom - containerRect.top + window.scrollY + 10;
        
      // Center horizontally but ensure it's within viewport bounds
      let leftPosition = Math.min(
        Math.max(viewportWidth * 0.2, rect.left + (rect.width / 2)),
        viewportWidth * 0.8
      );
      
      // Desktop positioning adjustments (when not mobile)
      if (!isMobile) {
        topPosition = rect.bottom - containerRect.top + window.scrollY + 5;
        leftPosition = rect.left + (rect.width / 2);
      }
      
      setButtonPosition({
        top: topPosition,
        left: leftPosition
      });
      
      setIsButtonVisible(true);
    };
    
    // Function to handle saving and highlighting - only save to parent state
    const handleSaveHighlight = () => {
      if (!selectedText) return;
      
      // Just save to parent state - don't manually apply highlight
      onHighlightSaved(selectedText);
      
      // Clear selection and hide button
      window.getSelection()?.removeAllRanges();
      setIsButtonVisible(false);
    };
    
    // Fallback highlighting method
    const highlightTextManually = (text: string, container: HTMLElement) => {
      // Get all text nodes in the container
      const textNodes = getAllTextNodes(container);
      let found = false;
      
      for (const node of textNodes) {
        const nodeText = node.textContent || '';
        const index = nodeText.indexOf(text);
        
        if (index >= 0 && !found) {
          try {
            // Create a range for this text
            const range = document.createRange();
            range.setStart(node, index);
            range.setEnd(node, index + text.length);
            
            // Create highlight span
            const span = document.createElement('span');
            span.className = styles['highlighted-text'];
            
            // Apply highlighting
            range.surroundContents(span);
            found = true;
            console.log('Manual highlighting successful');
            break;
          } catch (err) {
            console.error('Error in manual highlighting:', err);
            // Try another approach for complex DOM structures
            try {
              // Create a new range for this attempt
              const complexRange = document.createRange();
              complexRange.setStart(node, index);
              complexRange.setEnd(node, index + text.length);
              
              // Extract the content
              const fragment = complexRange.extractContents();
              
              // Create highlight span
              const span = document.createElement('span');
              span.className = styles['highlighted-text'];
              
              // Add the content to the span
              span.appendChild(fragment);
              
              // Insert the span
              complexRange.insertNode(span);
              found = true;
              console.log('Complex manual highlighting successful');
              break;
            } catch (extractErr) {
              console.error('Failed complex manual highlighting:', extractErr);
            }
          }
        }
      }
      
      if (!found) {
        console.warn('Could not find text to highlight:', text);
      }
    };
    
    // Get all text nodes in a container
    const getAllTextNodes = (element: Node): Text[] => {
      const textNodes: Text[] = [];
      
      const walk = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null
      );
      
      let node;
      while ((node = walk.nextNode())) {
        textNodes.push(node as Text);
      }
      
      return textNodes;
    };
    
    // Handle mouseup to detect selections
    const handleMouseUp = () => {
      setTimeout(handleSelection, 10);
    };
    
    // Handle touchend for mobile devices
    const handleTouchEnd = (e: TouchEvent) => {
      // Small delay to allow the browser to process the selection
      setTimeout(handleSelection, 100);
    };
    
    // Handle selection change event for both desktop and mobile
    const handleSelectionChange = () => {
      // Only process if we have a container
      if (container) {
        setTimeout(handleSelection, 50);
      }
    };

    // Handle clicks/touches outside to hide the button
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (
        buttonRef.current && 
        !buttonRef.current.contains(e.target as Node) && 
        container && 
        !container.contains(e.target as Node)
      ) {
        setIsButtonVisible(false);
      }
    };
    
    // Add event listeners for both mouse and touch
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick as EventListener, { passive: true });
    
    // Cleanup
    return () => {
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick as EventListener);
    };
  }, [containerId, onHighlightSaved, selectedText]);
  
  // Create button element
  const saveButton = (
    <div
      ref={buttonRef}
      className={styles['highlight-button']}
      style={{
        top: `${buttonPosition.top}px`,
        left: `${buttonPosition.left}px`,
        display: isButtonVisible ? 'block' : 'none',
        zIndex: zIndex.highlightButton
      }}
    >
      <button
        onClick={() => {
          console.log('Save button clicked for:', selectedText);
          
          // Just save to parent state - don't manually apply highlight
          // The useEffect will add the highlight when the highlights array updates
          onHighlightSaved(selectedText);
          
          // Hide button and clear selection
          setIsButtonVisible(false);
          window.getSelection()?.removeAllRanges();
        }}
      >
        <span className="flex items-center justify-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="mr-2"
          >
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </svg>
          Save
        </span>
      </button>
    </div>
  );
  
  return (
    <>
      {/* Render the save button */}
      {isButtonVisible && saveButton}
    </>
  );
};