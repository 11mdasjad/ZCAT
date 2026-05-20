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
      return errorResponse(new Error('Title/Topic is required'), 400);
    }

    // Try multiple models - only currently available models (2026)
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.5-pro'];
    let lastError = null;
    let data = null;

    for (const modelName of modelsToTry) {
      let retries = 1;
      while (retries >= 0) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          let prompt = '';

          if (type === 'MCQ') {
            prompt = `
              You are an expert technical interviewer and technical writer.
              Generate a rigorous, high-quality technical multiple-choice question (MCQ) based on the topic: "${title}".
              
              Return ONLY a JSON object with the following structure:
              {
                "description": "Clear and detailed technical question text or code snippet to analyze. Use Markdown formatting where appropriate.",
                "difficulty": "EASY" | "MEDIUM" | "HARD",
                "tags": ["tag1", "tag2"],
                "options": [
                  "Option A text",
                  "Option B text",
                  "Option C text",
                  "Option D text"
                ],
                "correctAnswer": "A" | "B" | "C" | "D",
                "explanation": "Detailed explanation of why this answer is correct and why other options are incorrect."
              }
              
              Requirements for MCQ:
              - Make the options challenging, plausible, and technically sound (avoid simple true/false or obvious distractors).
              - Suggested tags should be from standard conceptual topics (e.g., Arrays, Strings, SQL, Recursion, Closures, AI, Database, OOP, etc.).
              - Ensure difficulty matches technical standards.
            `;
          } else {
            prompt = `
              You are an expert competitive programming coach and technical interviewer.
              Generate a comprehensive coding problem based on the title/topic: "${title}".
              
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
          }

          const result = await model.generateContent(prompt);
          const response = await result.response;
          const text = response.text();
          
          let jsonString = text.trim();
          const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
          const match = jsonString.match(jsonBlockRegex);
          if (match) {
            jsonString = match[1].trim();
          } else {
            const firstBrace = jsonString.indexOf('{');
            const lastBrace = jsonString.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1) {
              jsonString = jsonString.substring(firstBrace, lastBrace + 1);
            }
          }

          data = JSON.parse(jsonString);
          if (data) break;
        } catch (error: any) {
          const errMsg = error.message || String(error);
          const isRateLimit = errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED');
          logger.error(`Failed with model ${modelName} (Retries left: ${retries}): ${errMsg}`);
          lastError = error;

          if (isRateLimit) {
            // Extract retry delay from error message if available
            const delayMatch = errMsg.match(/retry in (\d+)/i);
            const waitMs = delayMatch ? (parseInt(delayMatch[1]) + 2) * 1000 : 10000;
            logger.info(`Rate limited on ${modelName}, waiting ${waitMs}ms before next model...`);
            await new Promise(resolve => setTimeout(resolve, waitMs));
            break; // Move to next model instead of retrying same one
          }

          if (retries > 0) {
            retries--;
            await new Promise(resolve => setTimeout(resolve, 1500));
            continue;
          }
          break;
        }
      }
      if (data) break;
    }

    if (!data) {
      throw lastError || new Error('All models failed to generate content');
    }

    return successResponse(data);
  } catch (error: any) {
    logger.error('Gemini generation error:', error);
    const errMsg = error.message || 'Failed to generate question content';
    
    // Return user-friendly message for rate limits
    if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED')) {
      return errorResponse(new Error('AI generation quota temporarily exceeded. Please wait 30-60 seconds and try again.'), 429);
    }
    
    return errorResponse(new Error(errMsg), 500);
  }
}

