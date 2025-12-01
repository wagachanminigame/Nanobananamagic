
export enum AspectRatio {
  Square = "1:1",
  Portrait = "3:4",
  Landscape = "4:3",
  Wide = "16:9",
  Tall = "9:16",
  Grid3x3 = "grid_3x3", // Internal identifier for 3x3 grid mode
  XHeader = "x_header",  // Internal identifier for X Header (uses 16:9)
  Kindle = "kindle" // Internal identifier for Kindle Cover (uses 9:16)
}

export type ModelType = 'flash' | 'pro';

export interface ImageVariation {
  url: string;
  label: string; // e.g. "Front Side", "Back Side"
}

export interface GeneratedItem {
  id: string;
  imageUrl: string; // Primary image (usually front)
  originalPrompt: string;
  refinedPrompt: string;
  socialText: string;
  timestamp: number;
  aspectRatio: AspectRatio;
  model: ModelType;
  referenceImage?: string; // Deprecated: Use referenceImages instead (kept for backwards compatibility)
  referenceImages?: string[]; // Optional: Multiple reference images used as input
  angle?: string; // Display label
  angleId?: string; // ID for restoring state
  themeId?: string; // ID for restoring state
  variations?: ImageVariation[]; // For items with multiple views (e.g. Dakimakura)
}

export interface GenerationConfig {
  theme: string;
  customPrompt: string;
  aspectRatio: AspectRatio;
  isLooping: boolean;
  model: ModelType;
}

export type ThemeOption = {
  id: string;
  label: string;
  value: string;
};

export interface AngleOption {
  id: string;
  label: string;
  value: string;
  description: string;
}
