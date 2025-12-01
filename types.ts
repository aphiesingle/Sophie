export interface Palette {
  [key: string]: string; // "0": "#ffffff"
}

export interface AppState {
  startDigit: number;
  digitCount: number;
  gridWidth: number;
  cellSize: number;
  palette: Palette;
}

export interface GenerationStatus {
  isGenerating: boolean;
  error?: string;
}

// Ensure module is emitted by transpilers even if only types are used
export const TYPES_VERSION = 1;