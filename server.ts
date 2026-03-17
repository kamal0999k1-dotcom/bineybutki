import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

  // API Route for Analysis
  app.post("/api/analyze", async (req, res) => {
    try {
      const { fileData, mimeType } = req.body;

      if (!fileData || !mimeType) {
        return res.status(400).json({ error: "Missing file data or mime type" });
      }

      const model = ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              {
                inlineData: {
                  data: fileData.split(",")[1],
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
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("AI Error:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
