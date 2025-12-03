import { useState } from 'react';
import './ColorInput.css';

// Validate HEX color format
function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

// Normalize HEX color (ensure # prefix and uppercase)
function normalizeHexColor(color: string): string {
  let hex = color.trim();
  if (!hex.startsWith('#')) {
    hex = '#' + hex;
  }
  return hex.toUpperCase();
}

interface ColorInputProps {
  colors: string[];
  onChange: (colors: string[]) => void;
  disabled?: boolean;
}

export function ColorInput({ colors, onChange, disabled = false }: ColorInputProps) {
  const [expanded, setExpanded] = useState(false);
  const [errors, setErrors] = useState<Record<number, string>>({});

  const handleColorChange = (index: number, value: string) => {
    const newColors = [...colors];
    newColors[index] = value;

    // Validate on change
    const newErrors = { ...errors };
    if (value && !isValidHexColor(normalizeHexColor(value))) {
      newErrors[index] = 'Invalid HEX format';
    } else {
      delete newErrors[index];
    }
    setErrors(newErrors);

    onChange(newColors);
  };

  const addColor = () => {
    if (colors.length < 4) {
      onChange([...colors, '#667eea']);
    }
  };

  const removeColor = (index: number) => {
    const newColors = colors.filter((_, i) => i !== index);
    onChange(newColors);
  };

  return (
    <div className="color-input">
      <button
        type="button"
        className="color-toggle"
        onClick={() => setExpanded(!expanded)}
        disabled={disabled}
      >
        <span>Brand Colors (Optional)</span>
        <span className={`arrow ${expanded ? 'expanded' : ''}`}>&#9662;</span>
      </button>

      {expanded && (
        <div className="color-inputs">
          {colors.map((color, index) => (
            <div key={index} className="color-row">
              <input
                type="color"
                value={color}
                onChange={(e) => handleColorChange(index, e.target.value)}
                disabled={disabled}
                className="color-picker"
              />
              <div className="color-text-wrapper">
                <input
                  type="text"
                  value={color}
                  onChange={(e) => handleColorChange(index, e.target.value)}
                  placeholder="#000000"
                  disabled={disabled}
                  className={`color-text ${errors[index] ? 'error' : ''}`}
                />
                {errors[index] && <span className="color-error">{errors[index]}</span>}
              </div>
              <button
                type="button"
                onClick={() => removeColor(index)}
                disabled={disabled}
                className="color-remove"
              >
                &times;
              </button>
            </div>
          ))}
          {colors.length < 4 && (
            <button
              type="button"
              onClick={addColor}
              disabled={disabled}
              className="add-color"
            >
              + Add Color
            </button>
          )}
        </div>
      )}
    </div>
  );
}
