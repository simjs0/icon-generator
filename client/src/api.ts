import { StylePreset, GenerateResponse } from './types';

const API_BASE = '/api';

export async function fetchStyles(): Promise<StylePreset[]> {
  const response = await fetch(`${API_BASE}/styles`);
  if (!response.ok) {
    throw new Error('Failed to fetch styles');
  }
  return response.json();
}

export async function generateIcons(
  prompt: string,
  styleId: number,
  colors?: string[]
): Promise<GenerateResponse> {
  const response = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      styleId,
      colors: colors?.filter(c => c.trim() !== ''),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'Failed to generate icons');
  }

  return response.json();
}

export function getProxyImageUrl(imageUrl: string): string {
  return `${API_BASE}/proxy-image?url=${encodeURIComponent(imageUrl)}`;
}
