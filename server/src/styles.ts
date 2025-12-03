// 5 Preset styles based on the reference images
export interface StylePreset {
  id: number;
  name: string;
  description: string;
  promptModifier: string;
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 1,
    name: "Gradient Line Art",
    description: "Clean line art with pink-purple-yellow gradient fill",
    promptModifier: "clean flat vector icon, soft pastel gradient fill from lavender purple to soft pink to cream yellow, thin dark gray outline stroke, simple flat 2D illustration, smooth soft color transitions, solid light gray rounded rectangle background, centered single object, cute minimal vector illustration style, no shadows, no 3D effects, muted pastel colors, simple shapes"
  },
  {
    id: 2,
    name: "Playful Bubble",
    description: "Colorful doodle style with circular bubble background and stars",
    promptModifier: "cute colorful doodle icon, soft purple-blue circular bubble background, small yellow stars and dots decorations around, playful cartoon style, vibrant colors, hand-drawn feel, whimsical illustration, centered composition, cheerful and fun aesthetic"
  },
  {
    id: 3,
    name: "Whimsical Clouds",
    description: "Cute illustrated style with clouds and pastel colors",
    promptModifier: "cute whimsical icon with small white clouds, soft pastel mint and pink colors, small stars scattered around, dreamy illustration style, gentle colors, kawaii aesthetic, light airy feel, adorable cartoon style, white background with decorative elements"
  },
  {
    id: 4,
    name: "Glossy 3D",
    description: "Shiny blue plastic 3D look with reflections",
    promptModifier: "glossy 3D rendered icon, shiny blue plastic material, cyan and blue gradient, strong specular highlights, reflective surface, modern 3D style, clean white background, professional app icon look, smooth rounded form, single object"
  },
  {
    id: 5,
    name: "Circle Badge",
    description: "White silhouette icon inside dark teal circular badge",
    promptModifier: "flat minimal icon, white silhouette on dark teal green circular background, badge style, simple flat design, no gradients on icon, solid circle background, minimal details, clean vector style, logo icon aesthetic, centered white shape on colored circle"
  }
];

export function getStyleById(id: number): StylePreset | undefined {
  return STYLE_PRESETS.find(style => style.id === id);
}

// Generate 4 unique icon variations for a theme
export function generateIconPrompts(
  theme: string,
  style: StylePreset,
  colors?: string[]
): string[] {
  // Generate 4 different icon concepts for the theme
  const iconVariations = getIconVariations(theme);

  return iconVariations.map(variation => {
    let styleModifier = style.promptModifier;

    // If user provided brand colors, modify the prompt to use them
    if (colors && colors.length > 0) {
      const colorString = colors.join(" and ");
      // Add color instructions at the beginning for stronger effect
      const colorInstruction = `IMPORTANT: Use only these brand colors: ${colorString}. `;

      // Remove default color references from style modifier for some styles
      styleModifier = styleModifier
        .replace(/lavender purple to soft pink to cream yellow/g, colorString)
        .replace(/pink to purple to yellow/g, colorString)
        .replace(/purple-blue/g, colors[0] || 'purple-blue')
        .replace(/pastel mint and pink/g, colorString)
        .replace(/blue plastic material, cyan and blue gradient/g, `plastic material in ${colorString}`)
        .replace(/cyan and blue gradient/g, colorString)
        .replace(/dark teal green/g, colors[0] || 'dark teal green');

      return `${colorInstruction}${variation}, ${styleModifier}, single icon, 512x512, high quality, isolated on background, strictly use colors: ${colorString}`;
    }

    return `${variation}, ${styleModifier}, single icon, 512x512, high quality, isolated on background`;
  });
}

// Generate 4 different icon concepts based on the theme
function getIconVariations(theme: string): string[] {
  // These will be different interpretations of the same theme
  return [
    `${theme} icon design, first variation, unique representation`,
    `${theme} icon design, second variation, different perspective`,
    `${theme} icon design, third variation, alternative concept`,
    `${theme} icon design, fourth variation, creative interpretation`
  ];
}
