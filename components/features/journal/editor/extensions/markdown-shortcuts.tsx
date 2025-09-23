'use client';

import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { textblockTypeInputRule, wrappingInputRule, markInputRule } from '@tiptap/core';

// Define a plugin key for our custom plugin
const MarkdownShortcutsPluginKey = new PluginKey('markdown-shortcuts');

// Create a custom extension for markdown shortcuts
export const MarkdownShortcuts = Extension.create({
  name: 'markdownShortcuts',

  addInputRules() {
    const headingRule = textblockTypeInputRule(
      /^(#{1,3})\s$/,
      this.editor.schema.nodes.heading, 
      match => ({ level: match[1].length })
    );
    
    const boldRule = markInputRule(
      /\*\*([^*]+)\*\*$/,
      this.editor.schema.marks.bold
    );
    
    const italicRule = markInputRule(
      /\*([^*]+)\*$/,
      this.editor.schema.marks.italic
    );
    
    const highlightRule = markInputRule(
      /==([^=]+)==$/,
      this.editor.schema.marks.highlight
    );
    
    const codeRule = markInputRule(
      /`([^`]+)`$/,
      this.editor.schema.marks.code
    );
    
    const blockquoteRule = wrappingInputRule(
      /^>\s$/,
      this.editor.schema.nodes.blockquote
    );
    
    const bulletListRule = wrappingInputRule(
      /^\s*([-*])\s$/,
      this.editor.schema.nodes.bulletList
    );
    
    const orderedListRule = wrappingInputRule(
      /^\s*(\d+)\.\s$/,
      this.editor.schema.nodes.orderedList
    );

    return [
      headingRule,
      boldRule,
      italicRule,
      highlightRule,
      codeRule,
      blockquoteRule,
      bulletListRule,
      orderedListRule,
    ];
  },
  
  // Add a plugin to handle more complex markdown shortcuts like task lists
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: MarkdownShortcutsPluginKey,
        // We'll handle task lists and more complex patterns here if needed
      }),
    ];
  },
});