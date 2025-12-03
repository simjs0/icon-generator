import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { generateMultipleImages } from "./replicate";
import { STYLE_PRESETS, getStyleById, generateIconPrompts } from "./styles";

dotenv.config();

export const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// Get available styles
app.get("/api/styles", (req: Request, res: Response) => {
  res.json(STYLE_PRESETS);
});

// Generate icons endpoint
interface GenerateRequest {
  prompt: string;
  styleId: number;
  colors?: string[];
}

app.post("/api/generate", async (req: Request, res: Response) => {
  try {
    const { prompt, styleId, colors } = req.body as GenerateRequest;

    // Validation
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      res.status(400).json({ error: "Prompt is required" });
      return;
    }

    if (!styleId || typeof styleId !== "number") {
      res.status(400).json({ error: "Style ID is required" });
      return;
    }

    const style = getStyleById(styleId);
    if (!style) {
      res.status(400).json({ error: "Invalid style ID" });
      return;
    }

    // Validate colors if provided
    if (colors && !Array.isArray(colors)) {
      res.status(400).json({ error: "Colors must be an array" });
      return;
    }

    // Generate prompts for 4 icons
    const iconPrompts = generateIconPrompts(prompt.trim(), style, colors);

    console.log("Generating icons with prompts:", iconPrompts);

    // Generate all 4 images
    const imageUrls = await generateMultipleImages(iconPrompts);

    res.json({
      success: true,
      images: imageUrls,
      prompt: prompt.trim(),
      style: style.name,
    });
  } catch (error) {
    console.error("Error generating icons:", error);
    res.status(500).json({
      error: "Failed to generate icons",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Proxy endpoint to download images (handles CORS for client-side download)
app.get("/api/proxy-image", async (req: Request, res: Response) => {
  try {
    const { url } = req.query;

    if (!url || typeof url !== "string") {
      res.status(400).json({ error: "URL is required" });
      return;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/png";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", "attachment; filename=icon.png");
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error("Error proxying image:", error);
    res.status(500).json({ error: "Failed to fetch image" });
  }
});

// Only start server if this file is run directly (not imported for testing)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
