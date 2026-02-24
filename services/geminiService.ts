
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, IssueCategory, UrgencyLevel } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY || '' });

export const analyzeIssue = async (description: string, imageBase64?: string): Promise<AnalysisResult> => {
  const model = 'gemini-3-flash-preview';
  
  const contents: any[] = [{ text: `Analyze this civic problem report: "${description}". Provide a detailed analysis, including potential solutions or recommended actions for the community or local authorities.` }];
  
  if (imageBase64) {
    contents.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageBase64.split(',')[1] || imageBase64
      }
    });
  }

  const response = await ai.models.generateContent({
    model,
    contents: { parts: contents },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          category: {
            type: Type.STRING,
            description: 'The category of the civic issue.',
            enum: Object.values(IssueCategory)
          },
          urgency: {
            type: Type.STRING,
            description: 'The urgency level of the issue.',
            enum: Object.values(UrgencyLevel)
          },
          summary: {
            type: Type.STRING,
            description: 'A concise summary of the problem.'
          },
          tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Relevant tags for indexing.'
          },
          recommendedAction: {
            type: Type.STRING,
            description: 'A recommended action or potential solution for the issue.'
          }
        },
        required: ["category", "urgency", "summary", "tags", "recommendedAction"]
      }
    }
  });

  try {
    const result = JSON.parse(response.text || '{}');
    return result as AnalysisResult;
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return {
      category: IssueCategory.OTHER,
      urgency: UrgencyLevel.MEDIUM,
      summary: description.substring(0, 100),
      tags: [],
      recommendedAction: "No specific action recommended at this time."
    };
  }
};
