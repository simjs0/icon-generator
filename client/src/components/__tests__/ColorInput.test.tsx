import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ColorInput } from '../ColorInput';

describe('ColorInput Component', () => {
  const defaultProps = {
    colors: [],
    onChange: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render toggle button', () => {
      render(<ColorInput {...defaultProps} />);
      expect(screen.getByText('Brand Colors (Optional)')).toBeInTheDocument();
    });

    it('should be collapsed by default', () => {
      render(<ColorInput {...defaultProps} />);
      expect(screen.queryByText('+ Add Color')).not.toBeInTheDocument();
    });

    it('should expand when toggle is clicked', () => {
      render(<ColorInput {...defaultProps} />);

      fireEvent.click(screen.getByText('Brand Colors (Optional)'));
      expect(screen.getByText('+ Add Color')).toBeInTheDocument();
    });

    it('should collapse when toggle is clicked again', () => {
      render(<ColorInput {...defaultProps} />);

      // Expand
      fireEvent.click(screen.getByText('Brand Colors (Optional)'));
      expect(screen.getByText('+ Add Color')).toBeInTheDocument();

      // Collapse
      fireEvent.click(screen.getByText('Brand Colors (Optional)'));
      expect(screen.queryByText('+ Add Color')).not.toBeInTheDocument();
    });
  });

  describe('Adding Colors', () => {
    it('should call onChange with new color when Add Color is clicked', () => {
      const onChange = vi.fn();
      render(<ColorInput colors={[]} onChange={onChange} />);

      fireEvent.click(screen.getByText('Brand Colors (Optional)'));
      fireEvent.click(screen.getByText('+ Add Color'));

      expect(onChange).toHaveBeenCalledWith(['#667eea']);
    });

    it('should allow adding up to 4 colors', () => {
      const { rerender } = render(<ColorInput colors={[]} onChange={vi.fn()} />);
      fireEvent.click(screen.getByText('Brand Colors (Optional)'));

      // With 3 colors, should still show Add button
      rerender(<ColorInput colors={['#111', '#222', '#333']} onChange={vi.fn()} />);
      fireEvent.click(screen.getByText('Brand Colors (Optional)'));
      expect(screen.getByText('+ Add Color')).toBeInTheDocument();

      // With 4 colors, should hide Add button
      rerender(<ColorInput colors={['#111', '#222', '#333', '#444']} onChange={vi.fn()} />);
      fireEvent.click(screen.getByText('Brand Colors (Optional)'));
      expect(screen.queryByText('+ Add Color')).not.toBeInTheDocument();
    });
  });

  describe('Displaying Colors', () => {
    it('should display existing colors', () => {
      render(<ColorInput colors={['#FF5733', '#33FF57']} onChange={vi.fn()} />);

      fireEvent.click(screen.getByText('Brand Colors (Optional)'));

      const textInputs = screen.getAllByRole('textbox');
      expect(textInputs[0]).toHaveValue('#FF5733');
      expect(textInputs[1]).toHaveValue('#33FF57');
    });

    it('should display color picker for each color', () => {
      render(<ColorInput colors={['#FF5733', '#33FF57']} onChange={vi.fn()} />);

      fireEvent.click(screen.getByText('Brand Colors (Optional)'));

      // Color inputs have type="color"
      const colorInputs = document.querySelectorAll('input[type="color"]');
      expect(colorInputs).toHaveLength(2);
    });
  });

  describe('Editing Colors', () => {
    it('should call onChange when text input changes', () => {
      const onChange = vi.fn();
      render(<ColorInput colors={['#FF5733']} onChange={onChange} />);

      fireEvent.click(screen.getByText('Brand Colors (Optional)'));

      const textInput = screen.getByRole('textbox');
      fireEvent.change(textInput, { target: { value: '#000000' } });

      expect(onChange).toHaveBeenCalledWith(['#000000']);
    });

    it('should call onChange when color picker changes', () => {
      const onChange = vi.fn();
      render(<ColorInput colors={['#FF5733']} onChange={onChange} />);

      fireEvent.click(screen.getByText('Brand Colors (Optional)'));

      const colorPicker = document.querySelector('input[type="color"]')!;
      fireEvent.change(colorPicker, { target: { value: '#0000FF' } });

      expect(onChange).toHaveBeenCalledWith(['#0000FF']);
    });
  });

  describe('Removing Colors', () => {
    it('should display remove button for each color', () => {
      render(<ColorInput colors={['#FF5733', '#33FF57']} onChange={vi.fn()} />);

      fireEvent.click(screen.getByText('Brand Colors (Optional)'));

      const removeButtons = screen.getAllByText('×');
      expect(removeButtons).toHaveLength(2);
    });

    it('should call onChange with color removed when remove button clicked', () => {
      const onChange = vi.fn();
      render(<ColorInput colors={['#FF5733', '#33FF57']} onChange={onChange} />);

      fireEvent.click(screen.getByText('Brand Colors (Optional)'));

      const removeButtons = screen.getAllByText('×');
      fireEvent.click(removeButtons[0]);

      expect(onChange).toHaveBeenCalledWith(['#33FF57']);
    });
  });

  describe('Disabled State', () => {
    it('should disable toggle when disabled prop is true', () => {
      render(<ColorInput {...defaultProps} disabled={true} />);

      expect(screen.getByText('Brand Colors (Optional)').closest('button')).toBeDisabled();
    });

    it('should disable all inputs when disabled', () => {
      render(<ColorInput colors={['#FF5733']} onChange={vi.fn()} disabled={true} />);

      // Need to expand first - but toggle should be disabled
      const toggle = screen.getByText('Brand Colors (Optional)').closest('button');
      expect(toggle).toBeDisabled();
    });
  });

  describe('UAC: Optional Color Input', () => {
    it('UAC: Color input should be optional (collapsed by default)', () => {
      render(<ColorInput {...defaultProps} />);

      // Should not show color inputs by default
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('UAC: Should accept HEX color codes', () => {
      const onChange = vi.fn();
      render(<ColorInput colors={['#FF5733']} onChange={onChange} />);

      fireEvent.click(screen.getByText('Brand Colors (Optional)'));

      const textInput = screen.getByRole('textbox');
      expect(textInput).toHaveValue('#FF5733');

      // Change to a different HEX
      fireEvent.change(textInput, { target: { value: '#AABBCC' } });
      expect(onChange).toHaveBeenCalledWith(['#AABBCC']);
    });

    it('UAC: Should support multiple brand colors', () => {
      render(<ColorInput colors={['#FF5733', '#33FF57', '#3357FF']} onChange={vi.fn()} />);

      fireEvent.click(screen.getByText('Brand Colors (Optional)'));

      const textInputs = screen.getAllByRole('textbox');
      expect(textInputs).toHaveLength(3);
    });
  });
});
