import { GoogleGenAI, Type, Schema } from "@google/genai";
import { QuizQuestion, Language } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to clean base64 string (remove data URL prefix if present)
const cleanBase64 = (b64: string) => {
  return b64.replace(/^data:(.*,)?/, '');
};

export const extractTextFromDocument = async (
  fileBase64: string,
  mimeType: string
): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing.");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64(fileBase64),
            },
          },
          {
            text: "Extract all the readable text from this document or image exactly as it appears. Do not summarize, just extract the raw text content.",
          },
        ],
      },
    });

    return response.text || "";
  } catch (error) {
    console.error("Text Extraction Error:", error);
    throw error;
  }
};

export const summarizeDocument = async (
  fileBase64: string | null,
  mimeType: string | null,
  textInput: string | null,
  language: Language
): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing.");

  const langInstruction = language === 'ar' 
    ? "The output summary MUST be in Arabic language." 
    : "The output summary MUST be in English language.";

  const contentParts = [];
  
  // If we have edited text, use that. Otherwise use the file.
  if (textInput) {
    contentParts.push({ text: `Analyze the following text:` });
    contentParts.push({ text: textInput });
  } else if (fileBase64 && mimeType) {
    contentParts.push({
      inlineData: {
        mimeType: mimeType,
        data: cleanBase64(fileBase64),
      },
    });
  } else {
    throw new Error("No input provided");
  }

  contentParts.push({
    text: `Please analyze this content and provide a highly organized, structured summary. 
            
    Follow this exact structure:
    1. **Title**: A clear title for the summary.
    2. **Introduction**: A brief overview of what the document is about.
    3. **Key Concepts**: A section with bullet points highlighting the most important ideas, definitions, or dates.
    4. **Detailed Analysis**: A section breaking down the main topics with bold headings.
    5. **Conclusion**: A brief wrap-up.

    Use Markdown formatting (## for headers, - for bullets, ** for bold).
    ${langInstruction}`
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: contentParts,
      },
    });

    return response.text || "Failed to generate summary.";
  } catch (error) {
    console.error("Summarization Error:", error);
    throw error;
  }
};

export const generateQuizFromDocument = async (
  fileBase64: string | null,
  mimeType: string | null,
  textInput: string | null,
  count: number,
  language: Language
): Promise<QuizQuestion[]> => {
  if (!apiKey) throw new Error("API Key is missing.");

  const langInstruction = language === 'ar' 
    ? "The questions, options, and explanation MUST be in Arabic language." 
    : "The questions, options, and explanation MUST be in English language.";

  const quizSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.INTEGER },
        question: { type: Type.STRING },
        options: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        correctAnswerIndex: { 
          type: Type.INTEGER,
          description: "Zero-based index of the correct option (0, 1, 2, or 3)"
        },
        explanation: {
          type: Type.STRING,
          description: "A helpful explanation of the correct answer to learn from."
        }
      },
      required: ["id", "question", "options", "correctAnswerIndex", "explanation"],
    },
  };

  const contentParts = [];

  if (textInput) {
    contentParts.push({ text: `Analyze the following text:` });
    contentParts.push({ text: textInput });
  } else if (fileBase64 && mimeType) {
    contentParts.push({
      inlineData: {
        mimeType: mimeType,
        data: cleanBase64(fileBase64),
      },
    });
  } else {
    throw new Error("No input provided");
  }

  contentParts.push({
    text: `Generate ${count} multiple-choice questions based on the key concepts in this content. Each question should have 4 options. ${langInstruction} Return the result as a raw JSON array.`
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: contentParts,
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: quizSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No data returned from API");
    
    return JSON.parse(text) as QuizQuestion[];
  } catch (error) {
    console.error("Quiz Generation Error:", error);
    throw error;
  }
};