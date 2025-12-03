import type { VercelRequest, VercelResponse } from '@vercel/node';
import Replicate from 'replicate';

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

function getStyleById(id: number): StylePreset | undefined {
  return STYLE_PRESETS.find(style => style.id === id);
}

function generateIconPrompts(theme: string, style: StylePreset, colors?: string[]): string[] {
  const iconVariations = [
    `${theme} icon design, first variation, unique representation`,
    `${theme} icon design, second variation, different perspective`,
    `${theme} icon design, third variation, alternative concept`,
    `${theme} icon design, fourth variation, creative interpretation`
  ];

  return iconVariations.map(variation => {
    let styleModifier = style.promptModifier;

    if (colors && colors.length > 0) {
      const colorString = colors.join(" and ");
      const colorInstruction = `IMPORTANT: Use only these brand colors: ${colorString}. `;

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

// Timeout wrapper for promises
function withTimeout<T>(promise: Promise<T>, ms: number, errorMessage: string): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(errorMessage)), ms);
  });
  return Promise.race([promise, timeout]);
}

// Retry logic with exponential backoff
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on validation errors
      if (lastError.message.includes('Invalid') || lastError.message.includes('required')) {
        throw lastError;
      }

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

// API timeout: 90 seconds (Replicate can take 30-60s)
const API_TIMEOUT_MS = 90000;

async function generateImage(replicate: Replicate, prompt: string, seed?: number): Promise<string> {
  const generateFn = async () => {
    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt,
          width: 512,
          height: 512,
          num_outputs: 1,
          aspect_ratio: "1:1",
          output_format: "png",
          output_quality: 90,
          ...(seed !== undefined && { seed }),
        },
      }
    );

    if (Array.isArray(output) && output.length > 0) {
      return output[0] as string;
    }

    throw new Error("No image generated");
  };

  // Apply timeout and retry logic
  return withTimeout(
    withRetry(generateFn, 2, 2000),
    API_TIMEOUT_MS,
    'Image generation timed out. Please try again.'
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, styleId, colors } = req.body;

    // Validation
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!styleId || typeof styleId !== 'number') {
      return res.status(400).json({ error: 'Style ID is required' });
    }

    const style = getStyleById(styleId);
    if (!style) {
      return res.status(400).json({ error: 'Invalid style ID' });
    }

    if (colors && !Array.isArray(colors)) {
      return res.status(400).json({ error: 'Colors must be an array' });
    }

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const iconPrompts = generateIconPrompts(prompt.trim(), style, colors);

    // Generate all 4 images in parallel
    const imagePromises = iconPrompts.map((p, index) => {
      const seed = Date.now() + index * 1000;
      return generateImage(replicate, p, seed);
    });

    const imageUrls = await Promise.all(imagePromises);

    return res.status(200).json({
      success: true,
      images: imageUrls,
      prompt: prompt.trim(),
      style: style.name,
    });
  } catch (error) {
    console.error('Error generating icons:', error);
    return res.status(500).json({
      error: 'Failed to generate icons',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
