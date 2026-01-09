import { GoogleGenAI } from "@google/genai";
import { LocationAnalysis, GroundingChunk } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeLocationContext = async (
  latitude: number,
  longitude: number
): Promise<LocationAnalysis> => {
  try {
    const prompt = `Mă aflu la Latitudine: ${latitude}, Longitudine: ${longitude}.
    
    Te rog să faci următoarele folosind Google Search:
    1. Identifică adresa aproximativă sau numele locului (ex: parc, clădire, cartier) pentru aceste coordonate.
    2. Oferă un scurt rezumat de 2-3 propoziții despre ce este acest loc sau ce se află în apropiere.
    3. Dacă există fapte interesante sau locuri bine cotate în apropiere, menționează unul.
    
    Răspunde DOAR în limba română. Păstrează un ton util și concis.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "Nu s-a putut analiza contextul locației.";
    
    // Extract grounding metadata safely
    const groundingChunks = 
      response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    // Filter chunks to ensure they have web data (standardize type)
    const sources: GroundingChunk[] = groundingChunks.filter(
      (chunk: any) => chunk.web && chunk.web.uri && chunk.web.title
    ) as GroundingChunk[];

    return {
      description: text,
      sources: sources
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to analyze location with AI.");
  }
};