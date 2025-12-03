import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StyleSelector } from '../StyleSelector';
import { mockStyles } from '../../test/mocks';

describe('StyleSelector Component', () => {
  const defaultProps = {
    styles: mockStyles,
    selectedStyle: null,
    onSelectStyle: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the label "Select Style"', () => {
      render(<StyleSelector {...defaultProps} />);
      expect(screen.getByText('Select Style')).toBeInTheDocument();
    });

    it('should render all 5 style options', () => {
      render(<StyleSelector {...defaultProps} />);

      mockStyles.forEach(style => {
        expect(screen.getByText(style.name)).toBeInTheDocument();
      });
    });

    it('should display style numbers for each option', () => {
      render(<StyleSelector {...defaultProps} />);

      for (let i = 1; i <= 5; i++) {
        expect(screen.getByText(`Style ${i}`)).toBeInTheDocument();
      }
    });

    it('should show style description as title attribute', () => {
      render(<StyleSelector {...defaultProps} />);

      const gradientButton = screen.getByRole('button', { name: /gradient outline/i });
      expect(gradientButton).toHaveAttribute('title', mockStyles[0].description);
    });
  });

  describe('Selection', () => {
    it('should call onSelectStyle when a style is clicked', () => {
      const onSelectStyle = vi.fn();
      render(<StyleSelector {...defaultProps} onSelectStyle={onSelectStyle} />);

      fireEvent.click(screen.getByText('Gradient Outline'));
      expect(onSelectStyle).toHaveBeenCalledWith(1);
    });

    it('should call onSelectStyle with correct ID for each style', () => {
      const onSelectStyle = vi.fn();
      render(<StyleSelector {...defaultProps} onSelectStyle={onSelectStyle} />);

      mockStyles.forEach(style => {
        fireEvent.click(screen.getByText(style.name));
        expect(onSelectStyle).toHaveBeenCalledWith(style.id);
      });
    });

    it('should highlight selected style', () => {
      render(<StyleSelector {...defaultProps} selectedStyle={2} />);

      const selectedButton = screen.getByRole('button', { name: /cute pastel/i });
      expect(selectedButton).toHaveClass('selected');
    });

    it('should not highlight unselected styles', () => {
      render(<StyleSelector {...defaultProps} selectedStyle={2} />);

      const unselectedButton = screen.getByRole('button', { name: /gradient outline/i });
      expect(unselectedButton).not.toHaveClass('selected');
    });
  });

  describe('Disabled State', () => {
    it('should disable all buttons when disabled prop is true', () => {
      render(<StyleSelector {...defaultProps} disabled={true} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });

    it('should not call onSelectStyle when disabled and clicked', () => {
      const onSelectStyle = vi.fn();
      render(<StyleSelector {...defaultProps} onSelectStyle={onSelectStyle} disabled={true} />);

      fireEvent.click(screen.getByText('Gradient Outline'));
      expect(onSelectStyle).not.toHaveBeenCalled();
    });

    it('should enable all buttons when disabled prop is false', () => {
      render(<StyleSelector {...defaultProps} disabled={false} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe('UAC: 5 Preset Styles', () => {
    it('UAC: Should display exactly 5 preset style options', () => {
      render(<StyleSelector {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(5);
    });

    it('UAC: Each style should be selectable', () => {
      const onSelectStyle = vi.fn();
      render(<StyleSelector {...defaultProps} onSelectStyle={onSelectStyle} />);

      // Select each style and verify callback
      for (let i = 1; i <= 5; i++) {
        const button = screen.getByText(`Style ${i}`).closest('button');
        fireEvent.click(button!);
        expect(onSelectStyle).toHaveBeenLastCalledWith(i);
      }
    });
  });
});
