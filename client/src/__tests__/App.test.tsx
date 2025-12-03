import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { mockStyles, mockGenerateResponse } from '../test/mocks';

// Mock the api module
vi.mock('../api', () => ({
  fetchStyles: vi.fn(),
  generateIcons: vi.fn(),
  getProxyImageUrl: (url: string) => `/api/proxy-image?url=${encodeURIComponent(url)}`
}));

import { fetchStyles, generateIcons } from '../api';

const mockFetchStyles = fetchStyles as ReturnType<typeof vi.fn>;
const mockGenerateIcons = generateIcons as ReturnType<typeof vi.fn>;

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchStyles.mockResolvedValue(mockStyles);
  });

  describe('Initial Rendering', () => {
    it('should render app header', async () => {
      render(<App />);
      expect(screen.getByText('Icon Set Generator')).toBeInTheDocument();
    });

    it('should render subtitle', async () => {
      render(<App />);
      expect(screen.getByText('Generate 4 consistent icons from a single prompt')).toBeInTheDocument();
    });

    it('should render prompt input', async () => {
      render(<App />);
      expect(screen.getByLabelText('Prompt for Icon Set')).toBeInTheDocument();
    });

    it('should render placeholder text in prompt input', async () => {
      render(<App />);
      const input = screen.getByPlaceholderText(/e.g., "Toys", "Food", "Travel"/);
      expect(input).toBeInTheDocument();
    });

    it('should render generate button', async () => {
      render(<App />);
      expect(screen.getByRole('button', { name: /Generate Icons/i })).toBeInTheDocument();
    });

    it('should fetch styles on mount', async () => {
      render(<App />);

      await waitFor(() => {
        expect(mockFetchStyles).toHaveBeenCalledTimes(1);
      });
    });

    it('should render all 5 styles after loading', async () => {
      render(<App />);

      await waitFor(() => {
        mockStyles.forEach(style => {
          expect(screen.getByText(style.name)).toBeInTheDocument();
        });
      });
    });

    it('should render footer', async () => {
      render(<App />);
      expect(screen.getByText(/Powered by Flux-schnell/)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error when generate clicked without prompt', async () => {
      mockFetchStyles.mockResolvedValue(mockStyles);
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Gradient Outline')).toBeInTheDocument();
      });

      // Select a style
      fireEvent.click(screen.getByText('Gradient Outline'));

      // Try to generate without prompt
      fireEvent.click(screen.getByRole('button', { name: /Generate Icons/i }));

      expect(screen.getByText('Please enter a prompt')).toBeInTheDocument();
    });

    it('should show error when generate clicked without style', async () => {
      mockFetchStyles.mockResolvedValue(mockStyles);
      render(<App />);

      // Enter prompt but don't select style
      const input = screen.getByLabelText('Prompt for Icon Set');
      await userEvent.type(input, 'Toys');

      fireEvent.click(screen.getByRole('button', { name: /Generate Icons/i }));

      expect(screen.getByText('Please select a style')).toBeInTheDocument();
    });

    it('should disable generate button when prompt is empty', async () => {
      mockFetchStyles.mockResolvedValue(mockStyles);
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Gradient Outline')).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /Generate Icons/i });
      expect(button).toBeDisabled();
    });

    it('should disable generate button when no style selected', async () => {
      mockFetchStyles.mockResolvedValue(mockStyles);
      render(<App />);

      const input = screen.getByLabelText('Prompt for Icon Set');
      await userEvent.type(input, 'Toys');

      const button = screen.getByRole('button', { name: /Generate Icons/i });
      expect(button).toBeDisabled();
    });
  });

  describe('Generation Flow', () => {
    beforeEach(() => {
      mockGenerateIcons.mockResolvedValue(mockGenerateResponse);
    });

    it('should call generateIcons with correct parameters', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Gradient Outline')).toBeInTheDocument();
      });

      // Enter prompt
      const input = screen.getByLabelText('Prompt for Icon Set');
      await userEvent.type(input, 'Toys');

      // Select style
      fireEvent.click(screen.getByText('Gradient Outline'));

      // Generate
      fireEvent.click(screen.getByRole('button', { name: /Generate Icons/i }));

      await waitFor(() => {
        expect(mockGenerateIcons).toHaveBeenCalledWith('Toys', 1, []);
      });
    });

    it('should show loading state during generation', async () => {
      mockGenerateIcons.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Gradient Outline')).toBeInTheDocument();
      });

      const input = screen.getByLabelText('Prompt for Icon Set');
      await userEvent.type(input, 'Toys');
      fireEvent.click(screen.getByText('Gradient Outline'));
      fireEvent.click(screen.getByRole('button', { name: /Generate Icons/i }));

      expect(screen.getByText('Generating icons...')).toBeInTheDocument();
    });

    it('should show button text as "Generating..." during loading', async () => {
      mockGenerateIcons.mockImplementation(() => new Promise(() => {}));

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Gradient Outline')).toBeInTheDocument();
      });

      const input = screen.getByLabelText('Prompt for Icon Set');
      await userEvent.type(input, 'Toys');
      fireEvent.click(screen.getByText('Gradient Outline'));
      fireEvent.click(screen.getByRole('button', { name: /Generate Icons/i }));

      expect(screen.getByRole('button', { name: /Generating.../i })).toBeInTheDocument();
    });

    it('should display generated icons after successful generation', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Gradient Outline')).toBeInTheDocument();
      });

      const input = screen.getByLabelText('Prompt for Icon Set');
      await userEvent.type(input, 'Toys');
      fireEvent.click(screen.getByText('Gradient Outline'));
      fireEvent.click(screen.getByRole('button', { name: /Generate Icons/i }));

      await waitFor(() => {
        expect(screen.getByText('Generated Icons')).toBeInTheDocument();
      });
    });

    it('should display 4 images after successful generation', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Gradient Outline')).toBeInTheDocument();
      });

      const input = screen.getByLabelText('Prompt for Icon Set');
      await userEvent.type(input, 'Toys');
      fireEvent.click(screen.getByText('Gradient Outline'));
      fireEvent.click(screen.getByRole('button', { name: /Generate Icons/i }));

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images).toHaveLength(4);
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error when API fails', async () => {
      mockGenerateIcons.mockRejectedValue(new Error('API Error'));

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Gradient Outline')).toBeInTheDocument();
      });

      const input = screen.getByLabelText('Prompt for Icon Set');
      await userEvent.type(input, 'Toys');
      fireEvent.click(screen.getByText('Gradient Outline'));
      fireEvent.click(screen.getByRole('button', { name: /Generate Icons/i }));

      await waitFor(() => {
        expect(screen.getByText('API Error')).toBeInTheDocument();
      });
    });

    it('should display error when fetchStyles fails', async () => {
      mockFetchStyles.mockRejectedValue(new Error('Failed to load'));

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to load styles/)).toBeInTheDocument();
      });
    });
  });

  describe('Optional Colors', () => {
    it('should render color input section', async () => {
      render(<App />);
      expect(screen.getByText('Brand Colors (Optional)')).toBeInTheDocument();
    });

    it('should include colors in generation request when provided', async () => {
      mockGenerateIcons.mockResolvedValue(mockGenerateResponse);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Gradient Outline')).toBeInTheDocument();
      });

      // Enter prompt
      const input = screen.getByLabelText('Prompt for Icon Set');
      await userEvent.type(input, 'Toys');

      // Select style
      fireEvent.click(screen.getByText('Gradient Outline'));

      // Expand colors and add one
      fireEvent.click(screen.getByText('Brand Colors (Optional)'));
      fireEvent.click(screen.getByText('+ Add Color'));

      // Generate
      fireEvent.click(screen.getByRole('button', { name: /Generate Icons/i }));

      await waitFor(() => {
        expect(mockGenerateIcons).toHaveBeenCalledWith('Toys', 1, ['#667eea']);
      });
    });
  });

  describe('UAC: Complete User Flow', () => {
    beforeEach(() => {
      mockGenerateIcons.mockResolvedValue(mockGenerateResponse);
    });

    it('UAC: Complete flow - enter prompt, select style, generate 4 icons', async () => {
      render(<App />);

      // Wait for styles to load
      await waitFor(() => {
        expect(screen.getByText('Gradient Outline')).toBeInTheDocument();
      });

      // 1. Enter prompt
      const input = screen.getByLabelText('Prompt for Icon Set');
      await userEvent.type(input, 'Toys');
      expect(input).toHaveValue('Toys');

      // 2. Select a preset style
      fireEvent.click(screen.getByText('Cute Pastel'));

      // 3. Click Generate
      fireEvent.click(screen.getByRole('button', { name: /Generate Icons/i }));

      // 4. Verify API called correctly
      await waitFor(() => {
        expect(mockGenerateIcons).toHaveBeenCalledWith('Toys', 2, []);
      });

      // 5. Verify 4 icons displayed
      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images).toHaveLength(4);
      });

      // 6. Verify download buttons available
      const downloadButtons = screen.getAllByText('Download PNG');
      expect(downloadButtons).toHaveLength(4);
    });

    it('UAC: Flow with optional colors', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Gradient Outline')).toBeInTheDocument();
      });

      // Enter prompt
      const input = screen.getByLabelText('Prompt for Icon Set');
      await userEvent.type(input, 'Food');

      // Select style
      fireEvent.click(screen.getByText('Glossy 3D'));

      // Add brand colors
      fireEvent.click(screen.getByText('Brand Colors (Optional)'));
      fireEvent.click(screen.getByText('+ Add Color'));

      // Generate
      fireEvent.click(screen.getByRole('button', { name: /Generate Icons/i }));

      // Verify colors included
      await waitFor(() => {
        expect(mockGenerateIcons).toHaveBeenCalledWith('Food', 4, ['#667eea']);
      });

      // Verify results
      await waitFor(() => {
        expect(screen.getByText('Generated Icons')).toBeInTheDocument();
      });
    });
  });
});
