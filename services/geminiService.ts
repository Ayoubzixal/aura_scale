
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, FaceAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

const ANALYSIS_PROMPT = `
Follow these constraints strictly and be analytical:
Scope: ONLY analyze female faces. Ignore male faces or non-human objects.
Focus: EXCLUDE hair, makeup styling, and accessories from scoring calculations; focus purely on facial bone structure, features, and skin condition.
Strict Scoring: Use a strict bell-curve distribution. A score of 5.0 represents the global average. Scores above 8.5 are reserved for exceptional, model-tier traits. Do not artificially inflate scores.
Metrics & Weighting: For each detected face, assess the following 1-10 scores. Calculate the Overall Score using the assigned percentages:
Facial Symmetry (20%): Assessment of bilateral balance (eyes, brows, jawline).
Sexual Dimorphism (20%): Intensity of feminine markers (estrogenization), such as jaw width, lip fullness, and brow ridge prominence.
Golden Ratio (20%): Adherence to the Phi ratio (1.618) regarding vertical thirds and horizontal fifths spacing.
Skin Health (15%): Texture uniformity, absence of blemishes, and evenness of tone (independent of lighting).
Neoteny (15%): Youthful cues such as larger eye-to-face ratio, smaller nose, and shorter chin.
Averageness (10%): "Koinophilia" — the lack of deviant or irregular features compared to the population mean.
Output Format:
List specific scores and a brief 1-sentence biological justification for each metric.
Calculation: Show the math: (Sym × 0.20) + (Dim × 0.20) + (Gold × 0.20) + (Skin × 0.15) + (Neo × 0.15) + (Avg × 0.10) = Total
Final Score: Display the weighted average out of 10.
Ranking: If multiple faces are present, rank them from highest to lowest Overall Score.

The output MUST be a valid JSON array of face objects.
`;

export const analyzeFaces = async (base64Image: string): Promise<FaceAnalysis[]> => {
  const model = import.meta.env.VITE_GEMINI_MODEL || "gemini-3-flash-preview";

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { text: ANALYSIS_PROMPT },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image.split(',')[1] || base64Image,
          },
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING },
            scores: {
              type: Type.OBJECT,
              properties: {
                facialSymmetry: { type: Type.NUMBER },
                skinHealth: { type: Type.NUMBER },
                averageness: { type: Type.NUMBER },
                sexualDimorphism: { type: Type.NUMBER },
                neoteny: { type: Type.NUMBER },
                goldenRatio: { type: Type.NUMBER },
              },
              required: ["facialSymmetry", "skinHealth", "averageness", "sexualDimorphism", "neoteny", "goldenRatio"],
            },
            justifications: {
              type: Type.OBJECT,
              properties: {
                facialSymmetry: { type: Type.STRING },
                skinHealth: { type: Type.STRING },
                averageness: { type: Type.STRING },
                sexualDimorphism: { type: Type.STRING },
                neoteny: { type: Type.STRING },
                goldenRatio: { type: Type.STRING },
              },
              required: ["facialSymmetry", "skinHealth", "averageness", "sexualDimorphism", "neoteny", "goldenRatio"],
            },
            overallScore: { type: Type.NUMBER },
          },
          required: ["id", "scores", "justifications", "overallScore"],
        },
      },
    },
  });

  try {
    const data = JSON.parse(response.text);
    return data.map((face: any, index: number) => ({
      ...face,
      rank: index + 1
    }));
  } catch (error) {
    console.error("Failed to parse AI response", error);
    throw new Error("Invalid AI analysis response");
  }
};
