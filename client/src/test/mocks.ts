import { StylePreset, GenerateResponse } from '../types';

export const mockStyles: StylePreset[] = [
  {
    id: 1,
    name: 'Gradient Outline',
    description: 'Clean line art with gradient fills',
    promptModifier: 'gradient style'
  },
  {
    id: 2,
    name: 'Cute Pastel',
    description: 'Soft pastel colors with kawaii aesthetic',
    promptModifier: 'pastel style'
  },
  {
    id: 3,
    name: 'Textured Vintage',
    description: 'Retro style with subtle textures',
    promptModifier: 'vintage style'
  },
  {
    id: 4,
    name: 'Glossy 3D',
    description: 'Shiny, polished 3D look',
    promptModifier: '3d style'
  },
  {
    id: 5,
    name: 'Flat Minimal',
    description: 'Simple flat design with bold colors',
    promptModifier: 'flat style'
  }
];

export const mockGenerateResponse: GenerateResponse = {
  success: true,
  images: [
    'https://example.com/image1.png',
    'https://example.com/image2.png',
    'https://example.com/image3.png',
    'https://example.com/image4.png'
  ],
  prompt: 'Toys',
  style: 'Gradient Outline'
};

export const createMockFetch = (responses: Record<string, any>) => {
  return (url: string) => {
    const response = responses[url] || { ok: false, status: 404 };
    return Promise.resolve({
      ok: response.ok !== false,
      status: response.status || 200,
      json: () => Promise.resolve(response.data || response),
      blob: () => Promise.resolve(new Blob()),
      headers: new Headers({ 'content-type': 'image/png' }),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0))
    });
  };
};
