import { describe, it, expect, vi, beforeEach } from 'vitest';
import { journalTemplateService } from '@/services/api/journal-template-service';
import { JournalTemplate } from '@/types/journal';

// Mock fetch
global.fetch = vi.fn();

describe('JournalTemplateService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getTemplatesByCategory', () => {
    it('should fetch templates and group them by category', async () => {
      // Mock templates response
      const mockTemplates = [
        {
          id: '1',
          name: 'Daily Reflection',
          content: '# Daily Reflection\n\n## What went well today?\n\n## What could have gone better?\n\n## What am I grateful for?\n\n## What did I learn?',
          other: 'Reflect on your day',
          tag: ['Daily Journals', 'reflection', 'daily']
        },
        {
          id: '2',
          name: 'Gratitude Journal',
          content: '# Gratitude Journal\n\n## Three things I\'m grateful for today:\n\n1. \n2. \n3. \n\n## Why these matter to me:',
          other: 'Note things you are grateful for',
          tag: ['Wellness & Growth', 'gratitude', 'mindfulness']
        }
      ] as JournalTemplate[];

      // Mock fetch response
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTemplates,
      });

      // Call the service method
      const result = await journalTemplateService.getTemplatesByCategory();

      // Check that fetch was called correctly
      expect(fetch).toHaveBeenCalledWith('/api/journal-templates');

      // Check the result
      expect(result).toEqual({
        'Daily Journals': [mockTemplates[0]],
        'Wellness & Growth': [mockTemplates[1]],
        'Decision & Problem-Solving': []
      });
    });

    it('should handle API errors', async () => {
      // Mock fetch response for an error
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      // Check that the service throws an error
      await expect(journalTemplateService.getTemplatesByCategory()).rejects.toThrow(
        'Failed to fetch journal templates: 500'
      );
    });
  });

  describe('getTemplateById', () => {
    it('should fetch a template by ID', async () => {
      const mockTemplate = {
        id: '1',
        name: 'Daily Reflection',
        content: '# Daily Reflection\n\n## What went well today?\n\n## What could have gone better?\n\n## What am I grateful for?\n\n## What did I learn?',
        other: 'Reflect on your day',
        tag: ['Daily Journals', 'reflection', 'daily']
      } as JournalTemplate;

      // Mock fetch response
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTemplate,
      });

      // Call the service method
      const result = await journalTemplateService.getTemplateById('1');

      // Check that fetch was called correctly
      expect(fetch).toHaveBeenCalledWith('/api/journal-templates/1');

      // Check the result
      expect(result).toEqual(mockTemplate);
    });

    it('should handle API errors when fetching by ID', async () => {
      // Mock fetch response for an error
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      // Check that the service throws an error
      await expect(journalTemplateService.getTemplateById('999')).rejects.toThrow(
        'Failed to fetch journal template: 404'
      );
    });
  });
});