import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '../LoadingSpinner';

describe('LoadingSpinner Component', () => {
  describe('Rendering', () => {
    it('should render with default message', () => {
      render(<LoadingSpinner />);
      expect(screen.getByText('Generating icons...')).toBeInTheDocument();
    });

    it('should render custom message when provided', () => {
      render(<LoadingSpinner message="Loading styles..." />);
      expect(screen.getByText('Loading styles...')).toBeInTheDocument();
    });

    it('should render time hint', () => {
      render(<LoadingSpinner />);
      expect(screen.getByText('This may take 30-60 seconds')).toBeInTheDocument();
    });

    it('should render spinner animation elements', () => {
      const { container } = render(<LoadingSpinner />);

      const spinnerRings = container.querySelectorAll('.spinner-ring');
      expect(spinnerRings).toHaveLength(3);
    });
  });

  describe('UAC: Loading State', () => {
    it('UAC: Should show loading indicator during generation', () => {
      render(<LoadingSpinner />);

      // Should display loading spinner container
      const { container } = render(<LoadingSpinner />);
      expect(container.querySelector('.loading-container')).toBeInTheDocument();
    });

    it('UAC: Should inform user about expected wait time', () => {
      render(<LoadingSpinner />);

      expect(screen.getByText(/30-60 seconds/)).toBeInTheDocument();
    });
  });
});
