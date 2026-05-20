import { Prisma, Leaderboard, LeaderboardEntry } from '@prisma/client';
import { BaseRepository } from './base.repository';
import prisma from '@/lib/prisma/client';
import { logger } from '@/lib/logger/logger';
import { DatabaseError } from '@/lib/errors/app-error';

export interface LeaderboardEntryWithUser extends LeaderboardEntry {
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    sessions?: { integrityScore: number }[];
  };
}

export class LeaderboardRepository extends BaseRepository<
  Leaderboard,
  Prisma.LeaderboardCreateInput,
  Prisma.LeaderboardUpdateInput
> {
  protected modelName = Prisma.ModelName.Leaderboard;

  /**
   * Find leaderboard by assessment ID
   */
  async findByAssessmentId(assessmentId: string, includeEntries: boolean = false): Promise<Leaderboard | null> {
    try {
      return await prisma.leaderboard.findUnique({
        where: { assessmentId },
        include: includeEntries
          ? {
              entries: {
                orderBy: { rank: 'asc' },
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      avatarUrl: true,
                    },
                  },
                },
              },
            }
          : undefined,
      });
    } catch (error) {
      logger.error('Error finding leaderboard by assessment ID:', error);
      throw new DatabaseError('Failed to find leaderboard');
    }
  }

  /**
   * Find entry in a specific leaderboard for a user
   */
  async findEntry(leaderboardId: string, userId: string): Promise<LeaderboardEntry | null> {
    try {
      return await prisma.leaderboardEntry.findUnique({
        where: {
          leaderboardId_userId: {
            leaderboardId,
            userId,
          },
        },
      });
    } catch (error) {
      logger.error('Error finding leaderboard entry:', error);
      throw new DatabaseError('Failed to find leaderboard entry');
    }
  }

  /**
   * Get rank-sorted entries for a leaderboard
   */
  async getRankedEntries(leaderboardId: string): Promise<LeaderboardEntryWithUser[]> {
    try {
      const leaderboard = await prisma.leaderboard.findUnique({
        where: { id: leaderboardId },
        select: { assessmentId: true },
      });
      if (!leaderboard) throw new Error("Leaderboard not found");

      const entries = await prisma.leaderboardEntry.findMany({
        where: { leaderboardId },
        orderBy: { rank: 'asc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              sessions: {
                where: { assessmentId: leaderboard.assessmentId },
                select: { integrityScore: true },
              },
            },
          },
        },
      });
      return entries as unknown as LeaderboardEntryWithUser[];
    } catch (error) {
      logger.error('Error fetching ranked entries:', error);
      throw new DatabaseError('Failed to fetch ranked entries');
    }
  }

  /**
   * Create or update a leaderboard entry for a candidate
   */
  async upsertEntry(
    leaderboardId: string,
    userId: string,
    data: { score: number; timeTaken: number; problemsSolved: number; rank?: number }
  ): Promise<LeaderboardEntry> {
    try {
      return await prisma.leaderboardEntry.upsert({
        where: {
          leaderboardId_userId: {
            leaderboardId,
            userId,
          },
        },
        create: {
          leaderboardId,
          userId,
          score: data.score,
          timeTaken: data.timeTaken,
          problemsSolved: data.problemsSolved,
          rank: data.rank ?? 9999, // Temp high rank until recalculated
        },
        update: {
          score: data.score,
          timeTaken: data.timeTaken,
          problemsSolved: data.problemsSolved,
          ...(data.rank !== undefined ? { rank: data.rank } : {}),
        },
      });
    } catch (error) {
      logger.error('Error upserting leaderboard entry:', error);
      throw new DatabaseError('Failed to save leaderboard entry');
    }
  }

  /**
   * Recalculate ranks based on standard tiebreaker formulas:
   * 1. score DESC
   * 2. timeTaken ASC
   * 3. updatedAt ASC (earliest completion date wins)
   */
  async recalculateRanks(leaderboardId: string): Promise<void> {
    try {
      await prisma.$transaction(async (tx) => {
        // Fetch all entries for this leaderboard ordered by score desc, timeTaken asc, updatedAt asc
        const entries = await tx.leaderboardEntry.findMany({
          where: { leaderboardId },
          orderBy: [
            { score: 'desc' },
            { timeTaken: 'asc' },
            { updatedAt: 'asc' },
          ],
        });

        // Update ranks in the database
        for (let i = 0; i < entries.length; i++) {
          const entry = entries[i];
          const newRank = i + 1;

          if (entry.rank !== newRank) {
            await tx.leaderboardEntry.update({
              where: { id: entry.id },
              data: { rank: newRank },
            });
          }
        }
      });
    } catch (error) {
      logger.error('Error recalculating leaderboard ranks:', error);
      throw new DatabaseError('Failed to update leaderboard rankings');
    }
  }

  /**
   * Reset leaderboard rankings (delete all entries)
   */
  async resetLeaderboard(leaderboardId: string): Promise<void> {
    try {
      await prisma.leaderboardEntry.deleteMany({
        where: { leaderboardId },
      });
    } catch (error) {
      logger.error('Error resetting leaderboard entries:', error);
      throw new DatabaseError('Failed to reset leaderboard rankings');
    }
  }

  /**
   * Fetch list of all assessments with leaderboard details
   */
  async listAllLeaderboards(): Promise<any[]> {
    try {
      const assessments = await prisma.assessment.findMany({
        where: {
          deletedAt: null,
        },
        select: {
          id: true,
          title: true,
          type: true,
          status: true,
          duration: true,
          leaderboard: {
            select: {
              id: true,
              updatedAt: true,
              _count: {
                select: {
                  entries: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return assessments.map((assessment) => ({
        id: assessment.id,
        title: assessment.title,
        type: assessment.type,
        status: assessment.status,
        duration: assessment.duration,
        leaderboardConnected: !!assessment.leaderboard,
        leaderboardId: assessment.leaderboard?.id || null,
        participantsCount: assessment.leaderboard?._count.entries || 0,
        updatedAt: assessment.leaderboard?.updatedAt || null,
      }));
    } catch (error) {
      logger.error('Error listing assessments with leaderboards:', error);
      throw new DatabaseError('Failed to fetch leaderboards list');
    }
  }
}

export const leaderboardRepository = new LeaderboardRepository();
