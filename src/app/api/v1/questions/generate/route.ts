import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { logger } from '@/lib/logger/logger';

const apiKey = (process.env.GEMINI_API_KEY || '').trim();
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: NextRequest) {
  try {
    const { title, type = 'CODING' } = await req.json();

    if (!title) {
      return errorResponse(new Error('Title is required'), 400);
    }

    // Try multiple models - adjusted for 2026 model availability
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
    let lastError = null;
    let data = null;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const prompt = `
          You are an expert competitive programming coach and technical interviewer.
          Generate a comprehensive coding problem based on the title: "${title}".
          
          Return ONLY a JSON object with the following structure:
          {
            "description": "Clear and concise problem statement in Markdown. Include sections like # Problem, # Examples (at least 2), and # Constraints.",
            "difficulty": "EASY" | "MEDIUM" | "HARD",
            "tags": ["tag1", "tag2"],
            "constraints": ["constraint 1", "constraint 2"],
            "timeLimit": 2000,
            "memoryLimit": 256,
            "testCases": [
              {
                "input": "string representation of input",
                "expectedOutput": "string representation of output",
                "explanation": "brief explanation of why this input results in this output",
                "isHidden": boolean,
                "isSample": boolean
              }
            ]
          }
          
          Requirements for Test Cases:
          - Provide at least 5 test cases.
          - 2 should be sample test cases (isSample: true).
          - 3 should be hidden test cases (isHidden: true).
          - Ensure test cases cover edge cases.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        const jsonString = text.replace(/```json\n?|\n?```/g, '').trim();
        data = JSON.parse(jsonString);
        if (data) break;
      } catch (error: any) {
        logger.error(`Failed with model ${modelName}:`, error.message);
        lastError = error;
      }
    }

    if (!data) {
      throw lastError || new Error('All models failed to generate content');
    }

    return successResponse(data);
  } catch (error: any) {
    logger.error('Gemini generation error:', error);
    const message = error.message || 'Failed to generate question content';
    return errorResponse(new Error(message), 500);
  }
}
