
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, FaceAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

const ANALYSIS_PROMPT = `
Analyze the female faces in the provided image based on aesthetic biological norms. 
Follow these constraints strictly:
1. ONLY analyze female faces. Ignore male faces or non-human objects.
2. EXCLUDE hair from scoring calculations; focus purely on facial features and skin.
3. For each detected face, provide:
   - facialSymmetry: Score 1-10 (How balanced left and right sides are).
   - skinHealth: Score 1-10 (Even tone, clarity, texture).
   - averageness: Score 1-10 (Proximity to population average features).
   - sexualDimorphism: Score 1-10 (Feminine markers like high cheekbones, full lips).
   - neoteny: Score 1-10 (Youthful markers like large eyes, small nose).
   - goldenRatio: Score 1-10 (Ideal geometric spacing).
   - Justifications: A short sentence for each metric explaining the score.
   - overallScore: A weighted average score from 1-10.
4. If multiple faces exist, rank them by overall score.

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
