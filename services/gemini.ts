import { GoogleGenAI, Type } from "@google/genai";
import { Palette } from "../types";

export const generatePalette = async (theme: string): Promise<Palette> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
  }
  
  // Initialize client here to avoid top-level process access issues
  const ai = new GoogleGenAI({ apiKey });

  const model = "gemini-2.5-flash";
  const prompt = `Create a color palette of 10 distinct hex codes corresponding to digits 0-9 based on the theme: "${theme}". 
  Ensure the colors are visually appealing together.
  Return strictly a JSON object where keys are "0" through "9" and values are hex color strings (e.g. "#FF0000").`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
             "0": { type: Type.STRING },
             "1": { type: Type.STRING },
             "2": { type: Type.STRING },
             "3": { type: Type.STRING },
             "4": { type: Type.STRING },
             "5": { type: Type.STRING },
             "6": { type: Type.STRING },
             "7": { type: Type.STRING },
             "8": { type: Type.STRING },
             "9": { type: Type.STRING },
          },
          required: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) {
       throw new Error("No response text from Gemini.");
    }
    const palette = JSON.parse(jsonText) as Palette;
    return palette;

  } catch (error) {
    console.error("Error generating palette:", error);
    throw error;
  }
};