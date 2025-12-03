export interface StylePreset {
  id: number;
  name: string;
  description: string;
  promptModifier: string;
}

export interface GenerateResponse {
  success: boolean;
  images: string[];
  prompt: string;
  style: string;
}

export interface GenerateError {
  error: string;
  message?: string;
}
