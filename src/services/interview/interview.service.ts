/**
 * AI Interview Service
 * Handles business logic, database transactions, and Gemini AI interaction for mock interviews
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '@/lib/prisma/client';
import { logger } from '@/lib/logger/logger';

// Initialize Gemini
const apiKey = (process.env.GEMINI_API_KEY || '').trim();
const genAI = new GoogleGenerativeAI(apiKey);

export class InterviewService {
  /**
   * Helper to execute Gemini generation with model fallbacks and clean JSON extraction
   */
  private async generateAIContent(prompt: string): Promise<any> {
    if (!apiKey) {
      throw new Error('Gemini API key is not configured. Please set the GEMINI_API_KEY environment variable in your project settings (e.g. Vercel dashboard).');
    }
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.5-pro'];
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: 'application/json',
          },
        });

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

        const data = JSON.parse(jsonString);
        if (data) return data;
      } catch (error: any) {
        logger.error(`[InterviewAI] Failed with model ${modelName}:`, error);
        lastError = error;
      }
    }

    throw lastError || new Error('All models failed to generate content');
  }

  /**
   * Start a new mock interview session and generate the first question
   */
  async createSession(
    userId: string,
    title: string,
    category: string,
    difficulty: string,
    duration: number
  ) {
    logger.info('[InterviewService] Creating new session', { userId, title, category, difficulty });

    // 1. Generate the first question using Gemini
    const prompt = `
      You are an expert recruiter and technical interviewer conducting a mock interview.
      
      Interview Details:
      - Job Role: "${title}"
      - Round/Category: "${category}" (e.g. Technical, HR, Placement)
      - Difficulty: "${difficulty}" (EASY, MEDIUM, HARD)
      
      Generate the FIRST question of the interview. It should be highly professional, engaging, and relevant to the candidate's target job role and level. Make it conversational but direct, just like a real interview starter.
      
      Return ONLY a JSON object with this exact structure:
      {
        "question": "The actual interview question text, stated professionally.",
        "category": "The specific conceptual topic area (e.g., Core Principles, Coding Concepts, Resume/Introduction, Behavioral)"
      }
    `;

    const aiData = await this.generateAIContent(prompt);
    
    if (!aiData?.question) {
      throw new Error('Failed to generate initial question from Gemini');
    }

    // 2. Save session and initial question in a database transaction
    const session = await prisma.$transaction(async (tx) => {
      const newSession = await tx.interviewSession.create({
        data: {
          userId,
          title,
          duration,
          overallScore: null,
          feedback: null,
          transcript: '',
        },
      });

      const firstQuestion = await tx.interviewQuestion.create({
        data: {
          sessionId: newSession.id,
          question: aiData.question,
          category: aiData.category || category,
          order: 1,
        },
      });

      return {
        ...newSession,
        questions: [firstQuestion],
      };
    });

    return session;
  }

  /**
   * Submit candidate response, evaluate it, and generate the next question OR finish the interview
   */
  async submitResponse(
    userId: string,
    sessionId: string,
    questionId: string,
    responseText: string
  ) {
    logger.info('[InterviewService] Processing answer submission', { sessionId, questionId });

    // 1. Fetch current session and authorize user
    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
        responses: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!session) throw new Error('Interview session not found');
    if (session.userId !== userId) throw new Error('Unauthorized access to this session');
    if (session.endedAt) throw new Error('Interview has already ended');

    const currentQuestion = session.questions.find((q) => q.id === questionId);
    if (!currentQuestion) throw new Error('Question not found in this session');

    // 2. Count the current progress
    const currentQuestionIndex = currentQuestion.order; // e.g. 1
    const totalQuestions = 5; // Fixed 5 questions per interview for standard mock
    const isLastQuestion = currentQuestionIndex >= totalQuestions;

    // 3. Compile history of questions and candidate answers to provide flow context to Gemini
    const historyLines = session.questions.map((q) => {
      const resp = session.responses.find((r) => r.questionId === q.id);
      return `Interviewer: "${q.question}"\nCandidate: "${resp?.response || '(active question)'}"`;
    }).join('\n\n');

    // 4. Construct prompt for evaluating current answer and optionally generating next question
    let prompt = `
      You are an expert corporate recruiter and elite technical interviewer conducting a mock interview session.
      
      Target Job Role: "${session.title}"
      Round: "${currentQuestion.category}"
      Current Question Number: ${currentQuestionIndex} of ${totalQuestions}
      
      Conversation History So Far:
      ${historyLines}
      
      Current Question being answered: "${currentQuestion.question}"
      Candidate's Response: "${responseText}"
      
      Your Task:
      1. CRITICALLY EVALUATE the candidate's response to this specific current question. 
         - Score the answer on a scale of 0.0 to 10.0 (be fair, technical, and objective).
         - Provide helpful, constructive feedback (both strengths and specific improvement suggestions).
         - Write a perfect "Model Answer" representing what an ideal candidate would have answered to this question.
    `;

    if (!isLastQuestion) {
      prompt += `
      2. GENERATE THE NEXT QUESTION (Question ${currentQuestionIndex + 1} of ${totalQuestions}).
         - Transition naturally! Respond briefly/empathetically to the candidate's last answer, then ask the next question.
         - You can drill down deeper into their previous answer (to simulate cross-questioning) or transition to another key aspect required for the role.
         
      Return ONLY a JSON object with this exact structure:
      {
        "evaluation": {
          "score": 8.5,
          "feedback": "Your answer was very strong on technical details, but you missed explaining the complexity analysis.",
          "modelAnswer": "An ideal response would explain..."
        },
        "nextQuestion": {
          "question": "Great explanation. Moving on to system design: How would you scaling this database?",
          "category": "System Design"
        }
      }
      `;
    } else {
      prompt += `
      2. This was the FINAL question. Provide a comprehensive overall assessment of the entire interview session.
         - Calculate an overall holistic score out of 100 based on all their responses.
         - Summarize their general interview performance in a 3-4 sentence diagnostic summary.
         - Generate a list of their major "strengths".
         - Generate a list of critical "improvementAreas".
         
      Return ONLY a JSON object with this exact structure:
      {
        "evaluation": {
          "score": 7.8,
          "feedback": "You answered the final question adequately but could be more specific.",
          "modelAnswer": "The perfect answer would include..."
        },
        "overallFeedback": {
          "overallScore": 81.0,
          "summary": "Overall, you demonstrated excellent domain knowledge. Your technical communication is strong, but you need to manage your pacing and explain architectural trade-offs more explicitly.",
          "strengths": [
            "Strong grasp of frontend rendering patterns",
            "Structured problem-solving approach",
            "Clear technical explanations"
          ],
          "improvementAreas": [
            "Explain trade-offs and alternatives more explicitly",
            "Structure behavioral answers using the STAR method"
          ]
        }
      }
      `;
    }

    const aiResult = await this.generateAIContent(prompt);

    if (!aiResult?.evaluation) {
      throw new Error('Failed to evaluate response with Gemini');
    }

    // 5. Database transaction to save response and create next question OR close session
    const updatedData = await prisma.$transaction(async (tx) => {
      // a. Save response
      const dbResponse = await tx.interviewResponse.create({
        data: {
          sessionId,
          questionId,
          response: responseText,
          score: aiResult.evaluation.score,
          feedback: `${aiResult.evaluation.feedback}\n\n**Ideal Model Response:**\n${aiResult.evaluation.modelAnswer}`,
        },
      });

      // b. If there's a next question, create it
      let nextDbQuestion = null;
      if (!isLastQuestion && aiResult.nextQuestion) {
        nextDbQuestion = await tx.interviewQuestion.create({
          data: {
            sessionId,
            question: aiResult.nextQuestion.question,
            category: aiResult.nextQuestion.category || currentQuestion.category,
            order: currentQuestionIndex + 1,
          },
        });
      }

      // c. If it's the final question, save final overall scoring and complete the interview
      let overallFeedback = null;
      if (isLastQuestion && aiResult.overallFeedback) {
        overallFeedback = aiResult.overallFeedback;
        await tx.interviewSession.update({
          where: { id: sessionId },
          data: {
            endedAt: new Date(),
            overallScore: overallFeedback.overallScore,
            feedback: JSON.stringify(overallFeedback),
            transcript: historyLines + `\n\nCandidate Final Response: "${responseText}"`,
          },
        });
      }

      return {
        evaluation: {
          ...aiResult.evaluation,
          id: dbResponse.id,
        },
        nextQuestion: nextDbQuestion,
        overallFeedback,
      };
    });

    return updatedData;
  }

  /**
   * Retrieve a specific interview session details for scoring/feedback visualization
   */
  async getSessionDetails(userId: string, sessionId: string) {
    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
        responses: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!session) throw new Error('Session not found');
    if (session.userId !== userId) throw new Error('Unauthorized access');

    let parsedFeedback = null;
    if (session.feedback) {
      try {
        parsedFeedback = JSON.parse(session.feedback);
      } catch (e) {
        logger.error('Failed to parse overall feedback JSON:', e);
      }
    }

    return {
      ...session,
      parsedFeedback,
    };
  }

  /**
   * List all previous sessions for a user
   */
  async getUserSessions(userId: string) {
    return prisma.interviewSession.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      include: {
        questions: true,
        responses: true,
      },
    });
  }
}

export const interviewService = new InterviewService();
