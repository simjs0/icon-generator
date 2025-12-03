import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { IconGrid } from '../IconGrid';

// Mock the api module
vi.mock('../../api', () => ({
  getProxyImageUrl: (url: string) => `/api/proxy-image?url=${encodeURIComponent(url)}`
}));

describe('IconGrid Component', () => {
  const mockImages = [
    'https://example.com/image1.png',
    'https://example.com/image2.png',
    'https://example.com/image3.png',
    'https://example.com/image4.png'
  ];

  const defaultProps = {
    images: mockImages,
    prompt: 'Toys',
    style: 'Gradient Outline'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock fetch for download functionality
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(['test'], { type: 'image/png' }))
    });
  });

  describe('Rendering', () => {
    it('should render "Generated Icons" header', () => {
      render(<IconGrid {...defaultProps} />);
      expect(screen.getByText('Generated Icons')).toBeInTheDocument();
    });

    it('should display prompt in info section', () => {
      render(<IconGrid {...defaultProps} />);
      expect(screen.getByText(/Prompt: "Toys"/)).toBeInTheDocument();
    });

    it('should display style in info section', () => {
      render(<IconGrid {...defaultProps} />);
      expect(screen.getByText(/Style: Gradient Outline/)).toBeInTheDocument();
    });

    it('should render "Download All" button', () => {
      render(<IconGrid {...defaultProps} />);
      expect(screen.getByText('Download All')).toBeInTheDocument();
    });

    it('should render all 4 images', () => {
      render(<IconGrid {...defaultProps} />);

      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(4);
    });

    it('should set correct src for each image', () => {
      render(<IconGrid {...defaultProps} />);

      const images = screen.getAllByRole('img');
      mockImages.forEach((url, index) => {
        expect(images[index]).toHaveAttribute('src', url);
      });
    });

    it('should set alt text including prompt', () => {
      render(<IconGrid {...defaultProps} />);

      const images = screen.getAllByRole('img');
      images.forEach((img, index) => {
        expect(img).toHaveAttribute('alt', `Toys icon ${index + 1}`);
      });
    });

    it('should render download button for each image', () => {
      render(<IconGrid {...defaultProps} />);

      const downloadButtons = screen.getAllByText('Download PNG');
      expect(downloadButtons).toHaveLength(4);
    });
  });

  describe('Download Functionality', () => {
    it('should call fetch with proxy URL when individual download clicked', async () => {
      render(<IconGrid {...defaultProps} />);

      const downloadButtons = screen.getAllByText('Download PNG');
      fireEvent.click(downloadButtons[0]);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/proxy-image')
        );
      });
    });

    it('should trigger download with correct filename', async () => {
      // Mock createElement and appendChild
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      };
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);

      render(<IconGrid {...defaultProps} />);

      const downloadButtons = screen.getAllByText('Download PNG');
      fireEvent.click(downloadButtons[0]);

      await waitFor(() => {
        expect(mockLink.download).toBe('Toys-icon-1.png');
      });

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });

    it('should handle download error gracefully', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
      const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

      render(<IconGrid {...defaultProps} />);

      const downloadButtons = screen.getAllByText('Download PNG');
      fireEvent.click(downloadButtons[0]);

      await waitFor(() => {
        expect(windowOpenSpy).toHaveBeenCalledWith(mockImages[0], '_blank');
      });

      windowOpenSpy.mockRestore();
    });
  });

  describe('Download All', () => {
    it('should download all images when Download All is clicked', async () => {
      render(<IconGrid {...defaultProps} />);

      const downloadAllButton = screen.getByText('Download All');
      fireEvent.click(downloadAllButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(4);
      }, { timeout: 3000 });
    });
  });

  describe('UAC: Output Requirements', () => {
    it('UAC: Should display grid of 4 icons', () => {
      render(<IconGrid {...defaultProps} />);

      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(4);
    });

    it('UAC: All 4 icons should be different (unique URLs)', () => {
      render(<IconGrid {...defaultProps} />);

      const images = screen.getAllByRole('img');
      const srcs = images.map(img => img.getAttribute('src'));
      const uniqueSrcs = new Set(srcs);

      expect(uniqueSrcs.size).toBe(4);
    });

    it('UAC: Should provide downloadable PNGs', () => {
      render(<IconGrid {...defaultProps} />);

      const downloadButtons = screen.getAllByText('Download PNG');
      expect(downloadButtons).toHaveLength(4);
    });

    it('UAC: Should display matching visual style info', () => {
      render(<IconGrid {...defaultProps} />);

      expect(screen.getByText(/Style: Gradient Outline/)).toBeInTheDocument();
    });

    it('UAC: Should display theme/prompt info', () => {
      render(<IconGrid {...defaultProps} />);

      expect(screen.getByText(/Prompt: "Toys"/)).toBeInTheDocument();
    });
  });
});
