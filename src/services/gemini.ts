import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeQuestion(fileData: string, mimeType: string) {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            inlineData: {
              data: fileData.split(",")[1], // Remove the data:image/png;base64, part
              mimeType: mimeType,
            },
          },
          {
            text: `You are an expert tutor for Tribhuvan University (TU) Bachelor of Business Studies (BBS) 3rd year. 
            Analyze the question(s) in this image or document. There might be multiple questions (up to 30-40).
            
            For each question found:
            1. Identify the full marks allocated to the question (if mentioned, otherwise estimate based on complexity).
            2. Provide the answer in Nepali, adjusting the length based on marks:
               - 1 Mark: Very short and precise (1-2 sentences).
               - 2 Marks: Short answer (1 paragraph).
               - 5 Marks: Detailed answer (multiple paragraphs/points).
               - 10+ Marks: Comprehensive essay-style answer with introduction, points, and conclusion.
            
            Formatting Requirements:
            - Display the Question clearly in **Bold** or as a ### Heading.
            - Follow the question with the Answer.
            - Ensure there is a CLEAR visual gap (horizontal line or double spacing) between one question-answer set and the next.
            - The answer must be specifically tailored for the TU BBS 3rd year curriculum.
            - Ensure the tone is encouraging and clear.
            - Use Nepali medium for all content.`,
          },
        ],
      },
    ],
  });

  const response = await model;
  return response.text;
}
