import { Question, Difficulty } from '@prisma/client';
import {
  questionRepository,
  QuestionFilters,
  QuestionWithTestCases,
} from '@/repositories/question.repository';
import { AppError, createError } from '@/lib/errors/app-error';
import { logger } from '@/lib/logger/logger';

export interface QuestionListParams {
  page?: number;
  limit?: number;
  difficulty?: Difficulty;
  tags?: string[];
  search?: string;
}

export interface QuestionListResponse {
  questions: Question[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export class QuestionService {
  /**
   * Get paginated list of questions with filters
   */
  async getQuestions(params: QuestionListParams): Promise<QuestionListResponse> {
    try {
      const page = params.page || 1;
      const limit = params.limit || 20;

      const filters: QuestionFilters = {
        difficulty: params.difficulty,
        tags: params.tags,
        search: params.search,
        isActive: true,
      };

      const result = await questionRepository.findAllWithFilters(
        filters,
        page,
        limit
      );

      logger.info('Questions fetched', {
        page,
        limit,
        total: result.total,
        filters,
      });

      return {
        questions: result.questions,
        pagination: {
          page,
          limit,
          total: result.total,
          pages: result.pages,
        },
      };
    } catch (error) {
      logger.error('Failed to fetch questions', { error, params });
      throw createError.internal('Failed to fetch questions');
    }
  }

  /**
   * Get question by ID with test cases
   */
  async getQuestionById(
    id: string,
    userId?: string
  ): Promise<QuestionWithTestCases> {
    try {
      // Regular users don't see hidden test cases
      const includeHidden = false;

      const question = await questionRepository.findByIdWithTestCases(
        id,
        includeHidden
      );

      if (!question) {
        throw createError.notFound('Question not found');
      }

      if (!question.isActive) {
        throw createError.forbidden('Question is not available');
      }

      logger.info('Question fetched', { questionId: id, userId });

      return question;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Failed to fetch question', { error, id });
      throw createError.internal('Failed to fetch question');
    }
  }

  /**
   * Get question by slug with test cases
   */
  async getQuestionBySlug(
    slug: string,
    userId?: string
  ): Promise<QuestionWithTestCases> {
    try {
      const includeHidden = false;

      const question = await questionRepository.findBySlugWithTestCases(
        slug,
        includeHidden
      );

      if (!question) {
        throw createError.notFound('Question not found');
      }

      if (!question.isActive) {
        throw createError.forbidden('Question is not available');
      }

      logger.info('Question fetched by slug', { slug, userId });

      return question;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Failed to fetch question by slug', { error, slug });
      throw createError.internal('Failed to fetch question');
    }
  }

  /**
   * Get random question for practice
   */
  async getRandomQuestion(difficulty?: Difficulty): Promise<Question> {
    try {
      const question = await questionRepository.getRandomByDifficulty(difficulty);

      if (!question) {
        throw createError.notFound('No questions available');
      }

      logger.info('Random question fetched', { difficulty });

      return question;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Failed to fetch random question', { error, difficulty });
      throw createError.internal('Failed to fetch random question');
    }
  }

  /**
   * Get all available tags
   */
  async getTags(): Promise<string[]> {
    try {
      const tags = await questionRepository.getAllTags();
      logger.info('Tags fetched', { count: tags.length });
      return tags;
    } catch (error) {
      logger.error('Failed to fetch tags', { error });
      throw createError.internal('Failed to fetch tags');
    }
  }

  /**
   * Get difficulty statistics
   */
  async getDifficultyStats(): Promise<
    Array<{ difficulty: Difficulty; count: number }>
  > {
    try {
      const stats = await questionRepository.getDifficultyStats();
      logger.info('Difficulty stats fetched', { stats });
      return stats;
    } catch (error) {
      logger.error('Failed to fetch difficulty stats', { error });
      throw createError.internal('Failed to fetch difficulty stats');
    }
  }

  /**
   * Get popular questions
   */
  async getPopularQuestions(limit: number = 10): Promise<Question[]> {
    try {
      const questions = await questionRepository.getPopularQuestions(limit);
      logger.info('Popular questions fetched', { count: questions.length });
      return questions;
    } catch (error) {
      logger.error('Failed to fetch popular questions', { error });
      throw createError.internal('Failed to fetch popular questions');
    }
  }

  /**
   * Get questions by tags
   */
  async getQuestionsByTags(tags: string[], limit: number = 10): Promise<Question[]> {
    try {
      const questions = await questionRepository.findByTags(tags, limit);
      logger.info('Questions by tags fetched', { tags, count: questions.length });
      return questions;
    } catch (error) {
      logger.error('Failed to fetch questions by tags', { error, tags });
      throw createError.internal('Failed to fetch questions by tags');
    }
  }

  /**
   * Admin: Get question with hidden test cases
   */
  async getQuestionWithHiddenTests(id: string): Promise<QuestionWithTestCases> {
    try {
      const question = await questionRepository.findByIdWithTestCases(id, true);

      if (!question) {
        throw createError.notFound('Question not found');
      }

      logger.info('Question with hidden tests fetched', { questionId: id });

      return question;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Failed to fetch question with hidden tests', { error, id });
      throw createError.internal('Failed to fetch question');
    }
  }

  /**
   * Admin: Update question active status
   */
  async updateQuestionStatus(id: string, isActive: boolean): Promise<Question> {
    try {
      const question = await questionRepository.updateActiveStatus(id, isActive);
      logger.info('Question status updated', { questionId: id, isActive });
      return question;
    } catch (error) {
      logger.error('Failed to update question status', { error, id, isActive });
      throw createError.internal('Failed to update question status');
    }
  }

  /**
   * Admin: Create a new question with test cases
   */
  async createQuestion(data: any): Promise<Question> {
    try {
      const { testCases, constraints, examples, hints, ...questionData } = data;

      // Ensure slug is unique
      const existing = await questionRepository.findOne({ slug: questionData.slug });
      if (existing) {
        questionData.slug = `${questionData.slug}-${Date.now().toString(36)}`;
      }

      const question = await questionRepository.create({
        ...questionData,
        constraints: constraints || [],
        examples: examples || [],
        hints: hints || [],
        testCases: {
          create: (testCases || []).map((tc: any, index: number) => ({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            isHidden: tc.isHidden ?? false,
            isSample: tc.isSample ?? false,
            explanation: tc.explanation,
            orderIndex: tc.orderIndex ?? index,
            weight: tc.weight ?? 1,
          })),
        },
      });

      logger.info('Question created successfully', { questionId: question.id, title: question.title });
      return question;
    } catch (error: any) {
      logger.error('Failed to create question', { 
        error: error.message, 
        stack: error.stack,
        data 
      });
      throw createError.internal(`Failed to create question: ${error.message}`);
    }
  }
}

export const questionService = new QuestionService();
