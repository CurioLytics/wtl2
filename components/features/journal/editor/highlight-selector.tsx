'use client';

import { useEffect, useState, useRef } from 'react';
import { zIndex } from '@/utils/z-index';
import styles from '@/components/features/journal/editor/highlight-selector.module.css';

interface HighlightSelectorProps {
  containerId: string;
  onHighlightSaved: (text: string) => void;
  highlights: string[];
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
  const highlightedTextRefs = useRef<Map<string, HTMLElement[]>>(new Map());
  const selectionTimeout = useRef<NodeJS.Timeout | null>(null);

  const highlightTextInContainer = (text: string, container: HTMLElement) => {
    // Get a fresh snapshot of text nodes before modifying DOM
    const textNodes = getAllTextNodes(container);
    const refs: HTMLElement[] = [];

    // Process each text node
    for (const node of textNodes) {
      const parent = node.parentNode;
      if (!parent) continue;

      const nodeText = node.textContent || '';
      const indices: number[] = [];

      // Find all occurrences of text in this node
      let pos = 0;
      while (pos < nodeText.length) {
        const index = nodeText.indexOf(text, pos);
        if (index === -1) break;
        indices.push(index);
        pos = index + 1; // Move past this occurrence to find next
      }

      // If no matches, continue to next node
      if (indices.length === 0) continue;

      // Split the text node and wrap each occurrence
      let currentNode: Node = node;
      let offset = 0;

      for (const index of indices) {
        try {
          // Adjust index by offset from previous splits
          const adjustedIndex = index - offset;

          if (adjustedIndex < 0 || adjustedIndex >= (currentNode.textContent?.length || 0)) {
            continue;
          }

          // Split before the match
          if (adjustedIndex > 0 && currentNode.nodeType === Node.TEXT_NODE) {
            (currentNode as Text).splitText(adjustedIndex);
            currentNode = currentNode.nextSibling!;
          }

          // Split after the match
          if (currentNode.nodeType === Node.TEXT_NODE && (currentNode.textContent?.length || 0) > text.length) {
            (currentNode as Text).splitText(text.length);
          }

          // Wrap the match in a span
          const span = document.createElement('span');
          span.className = styles['highlighted-text'];
          span.textContent = currentNode.textContent;

          parent.replaceChild(span, currentNode);
          refs.push(span);

          // Move to next node
          currentNode = span.nextSibling!;
          offset = index + text.length;
        } catch (error) {
          console.error('Error highlighting text:', error);
          break;
        }
      }
    }

    if (refs.length > 0) {
      highlightedTextRefs.current.set(text, refs);
    }
  };

  const getAllTextNodes = (element: Node): Text[] => {
    const textNodes: Text[] = [];
    const walk = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);

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

    const removeUnwantedHighlights = () => {
      const highlightedSpans = container.querySelectorAll(`.${styles['highlighted-text']}`);

      highlightedSpans.forEach(span => {
        const text = span.textContent;
        if (text && !highlights.includes(text)) {
          const textNode = document.createTextNode(text);
          span.parentNode?.replaceChild(textNode, span);
        }
      });
    };

    const addMissingHighlights = () => {
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
    if (!container) return;

    const showSaveButton = () => {
      if (selectionTimeout.current) {
        clearTimeout(selectionTimeout.current);
      }

      selectionTimeout.current = setTimeout(() => {
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

        if (!container.contains(range.commonAncestorContainer)) {
          setIsButtonVisible(false);
          return;
        }

        setSelectedText(text);

        const rect = range.getBoundingClientRect();
        const buttonHeight = 40;
        const margin = 60;

        const topPosition = rect.top - buttonHeight - margin;
        const leftPosition = rect.left + (rect.width / 2);

        setButtonPosition({
          top: Math.max(10, topPosition),
          left: Math.max(10, Math.min(leftPosition, window.innerWidth - 100))
        });

        setIsButtonVisible(true);
      }, 100);
    };

    const handleSelectionChange = () => {
      showSaveButton();
    };

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;

      if (
        (buttonRef.current && buttonRef.current.contains(target)) ||
        (container && container.contains(target))
      ) {
        return;
      }

      setIsButtonVisible(false);
      setSelectedText('');
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mouseup', handleSelectionChange);
    document.addEventListener('touchend', handleSelectionChange);
    document.addEventListener('keyup', handleSelectionChange);
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick as EventListener, { passive: true });

    return () => {
      if (selectionTimeout.current) {
        clearTimeout(selectionTimeout.current);
      }
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mouseup', handleSelectionChange);
      document.removeEventListener('touchend', handleSelectionChange);
      document.removeEventListener('keyup', handleSelectionChange);
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick as EventListener);
    };
  }, [containerId]);

  // Create button element
  const saveButton = (
    <div
      ref={buttonRef}
      className="fixed transition-all duration-150 -translate-x-1/2"
      style={{
        top: `${buttonPosition.top}px`,
        left: `${buttonPosition.left}px`,
        zIndex: zIndex.highlightButton,
        opacity: isButtonVisible ? 1 : 0,
        transform: isButtonVisible ? 'translateX(-50%) scale(1)' : 'translateX(-50%) scale(0.95)',
        pointerEvents: isButtonVisible ? 'auto' : 'none'
      }}
    >
      <button
        onClick={() => {
          onHighlightSaved(selectedText);
          setIsButtonVisible(false);
          setSelectedText('');
          window.getSelection()?.removeAllRanges();
        }}
        className="btn-blue-primary shadow-lg flex items-center gap-1.5 whitespace-nowrap"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M5 13l4 4L19 7" />
        </svg>
      </button>
    </div>
  );


  return (
    <>
      {isButtonVisible && saveButton}
    </>
  );
};