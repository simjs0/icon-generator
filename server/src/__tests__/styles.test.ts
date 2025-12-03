import { STYLE_PRESETS, getStyleById, generateIconPrompts, StylePreset } from '../styles';

describe('Style Presets', () => {
  describe('STYLE_PRESETS', () => {
    it('should have exactly 5 preset styles', () => {
      expect(STYLE_PRESETS).toHaveLength(5);
    });

    it('should have unique IDs for all presets', () => {
      const ids = STYLE_PRESETS.map(style => style.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(5);
    });

    it('should have IDs from 1 to 5', () => {
      const ids = STYLE_PRESETS.map(style => style.id).sort();
      expect(ids).toEqual([1, 2, 3, 4, 5]);
    });

    it('each preset should have required properties', () => {
      STYLE_PRESETS.forEach(style => {
        expect(style).toHaveProperty('id');
        expect(style).toHaveProperty('name');
        expect(style).toHaveProperty('description');
        expect(style).toHaveProperty('promptModifier');
        expect(typeof style.id).toBe('number');
        expect(typeof style.name).toBe('string');
        expect(typeof style.description).toBe('string');
        expect(typeof style.promptModifier).toBe('string');
      });
    });

    it('each preset should have non-empty name and description', () => {
      STYLE_PRESETS.forEach(style => {
        expect(style.name.length).toBeGreaterThan(0);
        expect(style.description.length).toBeGreaterThan(0);
        expect(style.promptModifier.length).toBeGreaterThan(0);
      });
    });

    it('Style 1 should be Gradient Outline style', () => {
      const style1 = STYLE_PRESETS.find(s => s.id === 1);
      expect(style1?.name).toBe('Gradient Outline');
    });

    it('Style 2 should be Cute Pastel style', () => {
      const style2 = STYLE_PRESETS.find(s => s.id === 2);
      expect(style2?.name).toBe('Cute Pastel');
    });

    it('Style 3 should be Textured Vintage style', () => {
      const style3 = STYLE_PRESETS.find(s => s.id === 3);
      expect(style3?.name).toBe('Textured Vintage');
    });

    it('Style 4 should be Glossy 3D style', () => {
      const style4 = STYLE_PRESETS.find(s => s.id === 4);
      expect(style4?.name).toBe('Glossy 3D');
    });

    it('Style 5 should be Flat Minimal style', () => {
      const style5 = STYLE_PRESETS.find(s => s.id === 5);
      expect(style5?.name).toBe('Flat Minimal');
    });
  });

  describe('getStyleById', () => {
    it('should return correct style for valid IDs', () => {
      for (let i = 1; i <= 5; i++) {
        const style = getStyleById(i);
        expect(style).toBeDefined();
        expect(style?.id).toBe(i);
      }
    });

    it('should return undefined for invalid ID 0', () => {
      const style = getStyleById(0);
      expect(style).toBeUndefined();
    });

    it('should return undefined for invalid ID 6', () => {
      const style = getStyleById(6);
      expect(style).toBeUndefined();
    });

    it('should return undefined for negative ID', () => {
      const style = getStyleById(-1);
      expect(style).toBeUndefined();
    });
  });

  describe('generateIconPrompts', () => {
    const mockStyle: StylePreset = {
      id: 1,
      name: 'Test Style',
      description: 'Test description',
      promptModifier: 'test style modifier'
    };

    it('should generate exactly 4 prompts', () => {
      const prompts = generateIconPrompts('Toys', mockStyle);
      expect(prompts).toHaveLength(4);
    });

    it('should include theme in all prompts', () => {
      const theme = 'Animals';
      const prompts = generateIconPrompts(theme, mockStyle);
      prompts.forEach(prompt => {
        expect(prompt.toLowerCase()).toContain(theme.toLowerCase());
      });
    });

    it('should include style modifier in all prompts', () => {
      const prompts = generateIconPrompts('Food', mockStyle);
      prompts.forEach(prompt => {
        expect(prompt).toContain(mockStyle.promptModifier);
      });
    });

    it('should include 512x512 dimension in all prompts', () => {
      const prompts = generateIconPrompts('Travel', mockStyle);
      prompts.forEach(prompt => {
        expect(prompt).toContain('512x512');
      });
    });

    it('should generate unique prompts for variation', () => {
      const prompts = generateIconPrompts('Sports', mockStyle);
      const uniquePrompts = new Set(prompts);
      expect(uniquePrompts.size).toBe(4);
    });

    it('should include colors when provided', () => {
      const colors = ['#FF5733', '#33FF57'];
      const prompts = generateIconPrompts('Music', mockStyle, colors);
      prompts.forEach(prompt => {
        expect(prompt).toContain('#FF5733');
        expect(prompt).toContain('#33FF57');
      });
    });

    it('should not include color palette when no colors provided', () => {
      const prompts = generateIconPrompts('Nature', mockStyle);
      prompts.forEach(prompt => {
        expect(prompt).not.toContain('color palette:');
      });
    });

    it('should not include color palette when empty array provided', () => {
      const prompts = generateIconPrompts('Nature', mockStyle, []);
      prompts.forEach(prompt => {
        expect(prompt).not.toContain('color palette:');
      });
    });

    it('should work with real style presets', () => {
      STYLE_PRESETS.forEach(style => {
        const prompts = generateIconPrompts('Test', style);
        expect(prompts).toHaveLength(4);
        prompts.forEach(prompt => {
          expect(prompt).toContain(style.promptModifier);
        });
      });
    });
  });
});
