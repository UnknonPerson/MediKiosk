import { GoogleGenAI } from "@google/genai";

import env from "../../config/env.js";

const ai = new GoogleGenAI({
  apiKey: env.gemini.apiKey,
});

/**
 * Generate content using Gemini.
 *
 * This service is intentionally generic.
 * Intake, summary, document analysis, etc.
 * can all reuse this service later.
 */
export async function generateAIContent(
  prompt,
  options = {}
) {
  const response = await ai.models.generateContent({
    model: options.model || env.gemini.model,

    contents: prompt,

    config: {
      temperature:
        options.temperature ?? 0.4,

      responseMimeType:
        options.responseMimeType ||
        "application/json",
    },
  });

  return response.text;
}