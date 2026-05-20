import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { logger } from '@/lib/logger/logger';

const apiKey = (process.env.GEMINI_API_KEY || '').trim();
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || !text.trim()) {
      return errorResponse(new Error('Pasted content text is required'), 400);
    }

    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.5-pro', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
    let lastError = null;
    let data = null;

    for (const modelName of modelsToTry) {
      let retries = 2;
      while (retries >= 0) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion: 'v1' });
          const prompt = `
            You are an expert technical assessor, computer science professor, and competitive programming parser.
            Your task is to analyze the following raw, unstructured, or structured text block and parse/extract ALL technical multiple-choice questions (MCQs) and coding challenges.
            
            Raw Text to Parse:
            """
            ${text}
            """
            
            You MUST extract all valid questions from the text above and map them into a single clean JSON array.
            
            Required Output Format (strictly return ONLY a JSON array, no explanation or surrounding chat text, just raw JSON or a JSON codeblock):
            [
              {
                "title": "A short, descriptive, and professional title/topic for this question",
                "type": "MCQ" | "CODING",
                "difficulty": "EASY" | "MEDIUM" | "HARD",
                "tags": ["relevant-topic-tag1", "relevant-topic-tag2"],
                "description": "The full detailed question statement in Markdown. For MCQs, keep it to the core question statement (do not repeat the options A, B, C, D here). For coding, include a clean explanation of the problem, input format, and output format.",
                
                // MCQ Fields (Include ONLY if type is "MCQ"):
                "options": [
                  "Option A text",
                  "Option B text",
                  "Option C text",
                  "Option D text"
                ],
                "correctAnswer": "A" | "B" | "C" | "D",
                "explanation": "A detailed explanation of why the correct option is right and the others are incorrect.",
                
                // Coding Fields (Include ONLY if type is "CODING"):
                "constraints": ["Constraint 1", "Constraint 2"],
                "examples": ["Example 1: Input: x = 1, Output: y = 2", "Example 2: Input: x = 3, Output: y = 4"],
                "testCases": [
                  {
                    "input": "Input string to feed to code stdin",
                    "expectedOutput": "Expected exact output string from stdout",
                    "explanation": "A brief explanation of this test case",
                    "isHidden": false, // sample cases should be false, other test cases should be true
                    "isSample": true   // sample cases should be true, other test cases should be false
                  }
                ]
              }
            ]
            
            Parsing Guidelines:
            1. Be extremely robust: If options are listed as (1), (2), (3), (4) or a., b., c., d. or in plain lines, normalize them to 4 elements in the "options" array, and map "correctAnswer" to "A", "B", "C", or "D".
            2. For coding questions, if test cases are not explicitly listed in the text, intelligently synthesize at least 3 valid test cases (at least 1 sample and 2 hidden) matching the problem statement.
            3. If the difficulty is not specified in the text, guess the difficulty (EASY, MEDIUM, HARD) based on standard technical interviews.
            4. If a question is partially formed or ambiguous, try your best to complete and fix it logically rather than discarding it.
          `;

          const result = await model.generateContent(prompt);
          const response = await result.response;
          const resultText = response.text();
          
          const jsonString = resultText.replace(/```json\n?|\n?```/g, '').trim();
          data = JSON.parse(jsonString);
          if (data && Array.isArray(data)) break;
        } catch (error: any) {
          logger.error(`Failed bulk parse with model ${modelName} (Retries left: ${retries}): ${error.message || error}`);
          lastError = error;
          if (retries > 0) {
            retries--;
            await new Promise(resolve => setTimeout(resolve, 1500));
            continue;
          }
          break;
        }
      }
      if (data && Array.isArray(data)) break;
    }

    if (!data || !Array.isArray(data)) {
      throw lastError || new Error('All models failed to parse the bulk text into a valid JSON questions array');
    }

    return successResponse(data);
  } catch (error: any) {
    logger.error('Gemini bulk parsing error:', error);
    const message = error.message || 'Failed to parse the unstructured text';
    return errorResponse(new Error(message), 500);
  }
}
