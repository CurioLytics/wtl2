import { fetchPinnedTemplates } from '@/services/api/template-service';

// Mock global fetch
global.fetch = jest.fn();

describe('Template Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle original response format correctly', async () => {
    // Mock the fetch response for the original format
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        templates: [
          { id: '1', title: 'Original Template', category: 'Original Category' }
        ]
      })
    });

    // Call the function
    const result = await fetchPinnedTemplates('user123');

    // Verify result
    expect(result).toEqual([
      { id: '1', title: 'Original Template', category: 'Original Category' }
    ]);

    // Verify fetch was called with correct parameters
    expect(fetch).toHaveBeenCalledWith(
      'https://auto.zephyrastyle.com/webhook/get-pinned-template',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ profileId: 'user123' })
      })
    );
  });

  it('should handle nested response format correctly', async () => {
    // Mock the fetch response for the nested format
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ([
        {
          data: [
            {
              id: '6a4398bf-76a0-4a5e-88ad-50eedc6efcd5',
              name: 'Daily Reflection',
              content: 'What went well today?'
            },
            {
              id: '796f1de4-5bfb-4d9f-8a56-371f1975f781',
              name: 'Problem Solving',
              content: 'What symptom are you noticing?'
            }
          ]
        }
      ])
    });

    // Call the function
    const result = await fetchPinnedTemplates('user123');

    // Verify result - should transform 'name' to 'title' and determine categories
    expect(result).toEqual([
      {
        id: '6a4398bf-76a0-4a5e-88ad-50eedc6efcd5',
        title: 'Daily Reflection',
        category: 'Journaling',
        content: 'What went well today?'
      },
      {
        id: '796f1de4-5bfb-4d9f-8a56-371f1975f781',
        title: 'Problem Solving',
        category: 'Problem Solving',
        content: 'What symptom are you noticing?'
      }
    ]);
  });

  it('should return an empty array for unexpected response format', async () => {
    // Mock the fetch response with an unexpected format
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ unexpectedFormat: true })
    });

    // Call the function
    const result = await fetchPinnedTemplates('user123');

    // Should return empty array for unrecognized format
    expect(result).toEqual([]);
  });

  it('should throw an error for failed requests', async () => {
    // Mock a failed fetch response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500
    });

    // Call the function and expect it to throw
    await expect(fetchPinnedTemplates('user123')).rejects.toThrow('Failed to fetch pinned templates: 500');
  });
});