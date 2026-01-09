import { GoogleGenAI } from "@google/genai";
import { LocationAnalysis, GroundingChunk } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey });

export const analyzeLocationContext = async (
  latitude: number,
  longitude: number
): Promise<LocationAnalysis> => {
  try {
    if (!apiKey) {
      throw new Error("API Key is missing. Please check your environment variables.");
    }

    const prompt = `I am currently located at Latitude: ${latitude}, Longitude: ${longitude}. 
    
    Please do the following using Google Search:
    1. Identify the approximate address or specific place name (e.g., park, building, neighborhood) for these coordinates.
    2. Provide a brief 2-3 sentence summary of what this place is or what is nearby.
    3. If there are any interesting facts or highly rated spots nearby, mention one.
    
    Keep the tone helpful and concise.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "Could not analyze location context.";
    
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