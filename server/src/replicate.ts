import Replicate from "replicate";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Debug: log if token is loaded (remove in production)
console.log("Replicate token loaded:", process.env.REPLICATE_API_TOKEN ? "Yes" : "No");

export interface GenerateImageParams {
  prompt: string;
  width?: number;
  height?: number;
  seed?: number;
}

export async function generateImage(params: GenerateImageParams): Promise<string> {
  const { prompt, width = 512, height = 512, seed } = params;

  try {
    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt,
          width,
          height,
          num_outputs: 1,
          aspect_ratio: "1:1",
          output_format: "png",
          output_quality: 90,
          ...(seed !== undefined && { seed }),
        },
      }
    );

    // Flux-schnell returns an array of URLs
    if (Array.isArray(output) && output.length > 0) {
      return output[0] as string;
    }

    throw new Error("No image generated");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}

export async function generateMultipleImages(
  prompts: string[],
  baseSeed?: number
): Promise<string[]> {
  // Generate images in parallel for efficiency
  const promises = prompts.map((prompt, index) => {
    // Use different seeds for each image to ensure variation
    const seed = baseSeed ? baseSeed + index * 1000 : undefined;
    return generateImage({ prompt, seed });
  });

  const results = await Promise.all(promises);
  return results;
}
