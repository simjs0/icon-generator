import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchStyles, generateIcons, getProxyImageUrl } from '../api';
import { mockStyles, mockGenerateResponse } from '../test/mocks';

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchStyles', () => {
    it('should fetch styles from /api/styles', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockStyles)
      });

      await fetchStyles();

      expect(global.fetch).toHaveBeenCalledWith('/api/styles');
    });

    it('should return array of styles', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockStyles)
      });

      const result = await fetchStyles();

      expect(result).toEqual(mockStyles);
      expect(result).toHaveLength(5);
    });

    it('should throw error when response is not ok', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500
      });

      await expect(fetchStyles()).rejects.toThrow('Failed to fetch styles');
    });
  });

  describe('generateIcons', () => {
    it('should POST to /api/generate', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockGenerateResponse)
      });

      await generateIcons('Toys', 1);

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/generate',
        expect.objectContaining({
          method: 'POST'
        })
      );
    });

    it('should send correct headers', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockGenerateResponse)
      });

      await generateIcons('Toys', 1);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json'
          }
        })
      );
    });

    it('should send prompt and styleId in body', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockGenerateResponse)
      });

      await generateIcons('Toys', 1);

      const callArgs = (global.fetch as any).mock.calls[0][1];
      const body = JSON.parse(callArgs.body);

      expect(body.prompt).toBe('Toys');
      expect(body.styleId).toBe(1);
    });

    it('should send colors when provided', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockGenerateResponse)
      });

      await generateIcons('Toys', 1, ['#FF5733', '#33FF57']);

      const callArgs = (global.fetch as any).mock.calls[0][1];
      const body = JSON.parse(callArgs.body);

      expect(body.colors).toEqual(['#FF5733', '#33FF57']);
    });

    it('should filter out empty colors', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockGenerateResponse)
      });

      await generateIcons('Toys', 1, ['#FF5733', '', '  ', '#33FF57']);

      const callArgs = (global.fetch as any).mock.calls[0][1];
      const body = JSON.parse(callArgs.body);

      expect(body.colors).toEqual(['#FF5733', '#33FF57']);
    });

    it('should return generate response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockGenerateResponse)
      });

      const result = await generateIcons('Toys', 1);

      expect(result).toEqual(mockGenerateResponse);
    });

    it('should throw error with message from API', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Invalid style', message: 'Style ID must be 1-5' })
      });

      await expect(generateIcons('Toys', 10)).rejects.toThrow('Style ID must be 1-5');
    });

    it('should throw error with error field when no message', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Invalid style' })
      });

      await expect(generateIcons('Toys', 10)).rejects.toThrow('Invalid style');
    });

    it('should throw generic error when no error info', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({})
      });

      await expect(generateIcons('Toys', 10)).rejects.toThrow('Failed to generate icons');
    });
  });

  describe('getProxyImageUrl', () => {
    it('should return proxy URL with encoded image URL', () => {
      const imageUrl = 'https://example.com/image.png';
      const result = getProxyImageUrl(imageUrl);

      expect(result).toBe('/api/proxy-image?url=https%3A%2F%2Fexample.com%2Fimage.png');
    });

    it('should handle URLs with special characters', () => {
      const imageUrl = 'https://example.com/image?id=123&name=test';
      const result = getProxyImageUrl(imageUrl);

      expect(result).toContain('/api/proxy-image?url=');
      expect(result).toContain(encodeURIComponent(imageUrl));
    });
  });

  describe('UAC: API Integration', () => {
    it('UAC: Should support fetching 5 preset styles', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockStyles)
      });

      const styles = await fetchStyles();

      expect(styles).toHaveLength(5);
      styles.forEach((style, index) => {
        expect(style.id).toBe(index + 1);
        expect(style.name).toBeTruthy();
        expect(style.description).toBeTruthy();
      });
    });

    it('UAC: Should generate icons with prompt and style', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockGenerateResponse)
      });

      const result = await generateIcons('Toys', 1);

      expect(result.success).toBe(true);
      expect(result.images).toHaveLength(4);
      expect(result.prompt).toBe('Toys');
    });

    it('UAC: Should support optional colors in generation', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockGenerateResponse)
      });

      await generateIcons('Toys', 1, ['#FF0000', '#00FF00']);

      const body = JSON.parse((global.fetch as any).mock.calls[0][1].body);
      expect(body.colors).toEqual(['#FF0000', '#00FF00']);
    });

    it('UAC: Should provide image download proxy', () => {
      const url = getProxyImageUrl('https://replicate.com/output/image.png');

      expect(url).toContain('/api/proxy-image');
      expect(url).toContain('url=');
    });
  });
});
