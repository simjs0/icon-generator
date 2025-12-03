import type { VercelRequest, VercelResponse } from '@vercel/node';

interface StylePreset {
  id: number;
  name: string;
  description: string;
  promptModifier: string;
}

const STYLE_PRESETS: StylePreset[] = [
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

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json(STYLE_PRESETS);
}
