import { StylePreset } from '../types';
import './StyleSelector.css';

// Style preview images mapping
const stylePreviewImages: Record<number, string> = {
  1: '/styles/style1.png',
  2: '/styles/style2.png',
  3: '/styles/style3.png',
  4: '/styles/style4.png',
  5: '/styles/style5.png',
};

interface StyleSelectorProps {
  styles: StylePreset[];
  selectedStyle: number | null;
  onSelectStyle: (id: number) => void;
  disabled?: boolean;
}

export function StyleSelector({
  styles,
  selectedStyle,
  onSelectStyle,
  disabled = false,
}: StyleSelectorProps) {
  return (
    <div className="style-selector">
      <label className="style-label">Preset Styles</label>
      <div className="style-grid">
        {styles.map((style) => (
          <button
            key={style.id}
            className={`style-option ${selectedStyle === style.id ? 'selected' : ''}`}
            onClick={() => onSelectStyle(style.id)}
            disabled={disabled}
            title={style.description}
          >
            <div className="style-preview">
              <img
                src={stylePreviewImages[style.id]}
                alt={style.name}
                className="style-preview-img"
              />
            </div>
            <span className="style-number">Style {style.id}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
