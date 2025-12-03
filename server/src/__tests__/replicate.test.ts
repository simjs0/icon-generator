import { generateImage, generateMultipleImages, GenerateImageParams } from '../replicate';

// Mock the Replicate module
jest.mock('replicate', () => {
  return jest.fn().mockImplementation(() => ({
    run: jest.fn()
  }));
});

import Replicate from 'replicate';

describe('Replicate Service', () => {
  let mockRun: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRun = jest.fn();
    (Replicate as jest.Mock).mockImplementation(() => ({
      run: mockRun
    }));
  });

  describe('generateImage', () => {
    it('should call Replicate with correct model', async () => {
      mockRun.mockResolvedValue(['https://example.com/image.png']);

      await generateImage({ prompt: 'test prompt' });

      expect(mockRun).toHaveBeenCalledWith(
        'black-forest-labs/flux-schnell',
        expect.any(Object)
      );
    });

    it('should use default dimensions of 512x512', async () => {
      mockRun.mockResolvedValue(['https://example.com/image.png']);

      await generateImage({ prompt: 'test prompt' });

      expect(mockRun).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          input: expect.objectContaining({
            width: 512,
            height: 512
          })
        })
      );
    });

    it('should include prompt in the request', async () => {
      mockRun.mockResolvedValue(['https://example.com/image.png']);
      const testPrompt = 'A beautiful sunset';

      await generateImage({ prompt: testPrompt });

      expect(mockRun).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          input: expect.objectContaining({
            prompt: testPrompt
          })
        })
      );
    });

    it('should request PNG output format', async () => {
      mockRun.mockResolvedValue(['https://example.com/image.png']);

      await generateImage({ prompt: 'test' });

      expect(mockRun).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          input: expect.objectContaining({
            output_format: 'png'
          })
        })
      );
    });

    it('should request 1:1 aspect ratio', async () => {
      mockRun.mockResolvedValue(['https://example.com/image.png']);

      await generateImage({ prompt: 'test' });

      expect(mockRun).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          input: expect.objectContaining({
            aspect_ratio: '1:1'
          })
        })
      );
    });

    it('should return first image URL from array response', async () => {
      const expectedUrl = 'https://example.com/generated-image.png';
      mockRun.mockResolvedValue([expectedUrl]);

      const result = await generateImage({ prompt: 'test' });

      expect(result).toBe(expectedUrl);
    });

    it('should throw error when no image is generated', async () => {
      mockRun.mockResolvedValue([]);

      await expect(generateImage({ prompt: 'test' }))
        .rejects.toThrow('No image generated');
    });

    it('should throw error when API returns null', async () => {
      mockRun.mockResolvedValue(null);

      await expect(generateImage({ prompt: 'test' }))
        .rejects.toThrow();
    });

    it('should include seed when provided', async () => {
      mockRun.mockResolvedValue(['https://example.com/image.png']);

      await generateImage({ prompt: 'test', seed: 12345 });

      expect(mockRun).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          input: expect.objectContaining({
            seed: 12345
          })
        })
      );
    });

    it('should propagate API errors', async () => {
      const apiError = new Error('API rate limit exceeded');
      mockRun.mockRejectedValue(apiError);

      await expect(generateImage({ prompt: 'test' }))
        .rejects.toThrow('API rate limit exceeded');
    });
  });

  describe('generateMultipleImages', () => {
    it('should generate 4 images for 4 prompts', async () => {
      mockRun.mockResolvedValue(['https://example.com/image.png']);
      const prompts = ['prompt1', 'prompt2', 'prompt3', 'prompt4'];

      const results = await generateMultipleImages(prompts);

      expect(results).toHaveLength(4);
      expect(mockRun).toHaveBeenCalledTimes(4);
    });

    it('should return array of image URLs', async () => {
      mockRun
        .mockResolvedValueOnce(['https://example.com/image1.png'])
        .mockResolvedValueOnce(['https://example.com/image2.png'])
        .mockResolvedValueOnce(['https://example.com/image3.png'])
        .mockResolvedValueOnce(['https://example.com/image4.png']);

      const prompts = ['p1', 'p2', 'p3', 'p4'];
      const results = await generateMultipleImages(prompts);

      expect(results).toEqual([
        'https://example.com/image1.png',
        'https://example.com/image2.png',
        'https://example.com/image3.png',
        'https://example.com/image4.png'
      ]);
    });

    it('should use different seeds for each image when baseSeed provided', async () => {
      mockRun.mockResolvedValue(['https://example.com/image.png']);
      const prompts = ['p1', 'p2', 'p3', 'p4'];

      await generateMultipleImages(prompts, 1000);

      // Check that each call had a different seed
      const calls = mockRun.mock.calls;
      const seeds = calls.map(call => call[1].input.seed);
      const uniqueSeeds = new Set(seeds);
      expect(uniqueSeeds.size).toBe(4);
    });

    it('should handle empty prompts array', async () => {
      const results = await generateMultipleImages([]);

      expect(results).toHaveLength(0);
      expect(mockRun).not.toHaveBeenCalled();
    });

    it('should fail if any image generation fails', async () => {
      mockRun
        .mockResolvedValueOnce(['https://example.com/image1.png'])
        .mockRejectedValueOnce(new Error('Generation failed'));

      const prompts = ['p1', 'p2'];

      await expect(generateMultipleImages(prompts))
        .rejects.toThrow('Generation failed');
    });
  });
});
