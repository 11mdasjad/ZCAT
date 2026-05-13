import { Prisma, Question, Difficulty } from '@prisma/client';
import { BaseRepository } from './base.repository';
import prisma from '@/lib/prisma/client';

export interface QuestionFilters {
  difficulty?: Difficulty;
  tags?: string[];
  search?: string;
  isActive?: boolean;
}

export interface QuestionWithTestCases extends Question {
  testCases: Array<{
    id: string;
    input: string;
    expectedOutput: string;
    isHidden: boolean;
    explanation: string | null;
    orderIndex: number;
  }>;
}

export class QuestionRepository extends BaseRepository<Question, Prisma.QuestionCreateInput, Prisma.QuestionUpdateInput> {
  constructor() {
    super('question');
  }

  /**
   * Find all questions with optional filters and pagination
   */
  async findAllWithFilters(
    filters: QuestionFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<{ questions: Question[]; total: number; pages: number }> {
    const where: Prisma.QuestionWhereInput = {
      isActive: filters.isActive ?? true,
    };

    // Filter by difficulty
    if (filters.difficulty) {
      where.difficulty = filters.difficulty;
    }

    // Filter by tags (array contains any of the provided tags)
    if (filters.tags && filters.tags.length > 0) {
      where.tags = {
        hasSome: filters.tags,
      };
    }

    // Search in title and description
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.question.count({ where }),
    ]);

    return {
      questions,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Find question by slug with test cases
   */
  async findBySlugWithTestCases(
    slug: string,
    includeHidden: boolean = false
  ): Promise<QuestionWithTestCases | null> {
    const question = await prisma.question.findUnique({
      where: { slug },
      include: {
        testCases: {
          where: includeHidden ? {} : { isHidden: false },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    return question as QuestionWithTestCases | null;
  }

  /**
   * Find question by ID with test cases
   */
  async findByIdWithTestCases(
    id: string,
    includeHidden: boolean = false
  ): Promise<QuestionWithTestCases | null> {
    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        testCases: {
          where: includeHidden ? {} : { isHidden: false },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    return question as QuestionWithTestCases | null;
  }

  /**
   * Get random question by difficulty
   */
  async getRandomByDifficulty(difficulty?: Difficulty): Promise<Question | null> {
    const where: Prisma.QuestionWhereInput = {
      isActive: true,
    };

    if (difficulty) {
      where.difficulty = difficulty;
    }

    const count = await prisma.question.count({ where });

    if (count === 0) {
      return null;
    }

    const skip = Math.floor(Math.random() * count);

    const question = await prisma.question.findFirst({
      where,
      skip,
    });

    return question;
  }

  /**
   * Get questions by tags
   */
  async findByTags(tags: string[], limit: number = 10): Promise<Question[]> {
    return prisma.question.findMany({
      where: {
        isActive: true,
        tags: {
          hasSome: tags,
        },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get difficulty statistics
   */
  async getDifficultyStats(): Promise<
    Array<{ difficulty: Difficulty; count: number }>
  > {
    const stats = await prisma.question.groupBy({
      by: ['difficulty'],
      where: { isActive: true },
      _count: true,
    });

    return stats.map((stat) => ({
      difficulty: stat.difficulty,
      count: stat._count,
    }));
  }

  /**
   * Get all unique tags
   */
  async getAllTags(): Promise<string[]> {
    const questions = await prisma.question.findMany({
      where: { isActive: true },
      select: { tags: true },
    });

    const tagsSet = new Set<string>();
    questions.forEach((q) => {
      q.tags.forEach((tag) => tagsSet.add(tag));
    });

    return Array.from(tagsSet).sort();
  }

  /**
   * Get popular questions (most submissions)
   */
  async getPopularQuestions(limit: number = 10): Promise<Question[]> {
    const questions = await prisma.question.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { submissions: true },
        },
      },
      orderBy: {
        submissions: {
          _count: 'desc',
        },
      },
      take: limit,
    });

    return questions;
  }

  /**
   * Update question active status
   */
  async updateActiveStatus(id: string, isActive: boolean): Promise<Question> {
    return this.update(id, { isActive });
  }

  /**
   * Bulk create questions
   */
  async bulkCreate(
    questions: Prisma.QuestionCreateInput[]
  ): Promise<Prisma.BatchPayload> {
    return prisma.question.createMany({
      data: questions as any,
      skipDuplicates: true,
    });
  }
}

export const questionRepository = new QuestionRepository();
