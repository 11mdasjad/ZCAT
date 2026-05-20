import { Leaderboard, LeaderboardEntry } from '@prisma/client';
import { leaderboardRepository, LeaderboardEntryWithUser } from '@/repositories/leaderboard.repository';
import prisma from '@/lib/prisma/client';
import { createError } from '@/lib/errors/app-error';
import { logger } from '@/lib/logger/logger';

export interface LeaderboardDetails {
  leaderboard: Leaderboard;
  entries: LeaderboardEntryWithUser[];
}

export class LeaderboardService {
  /**
   * Get dynamic leaderboard and its sorted rankings for an assessment
   */
  async getLeaderboard(assessmentId: string): Promise<LeaderboardDetails> {
    try {
      const leaderboard = await leaderboardRepository.findByAssessmentId(assessmentId);
      if (!leaderboard) {
        throw createError.notFound('Leaderboard is not connected to this assessment');
      }

      const entries = await leaderboardRepository.getRankedEntries(leaderboard.id);

      return {
        leaderboard,
        entries,
      };
    } catch (error) {
      logger.error(`Failed to fetch leaderboard for assessment ${assessmentId}:`, error);
      throw error;
    }
  }

  /**
   * Toggle leaderboard connection status for an assessment
   */
  async toggleLeaderboard(assessmentId: string, enabled: boolean): Promise<Leaderboard | null> {
    try {
      const assessment = await prisma.assessment.findUnique({
        where: { id: assessmentId },
      });

      if (!assessment) {
        throw createError.notFound('Assessment not found');
      }

      const existingLeaderboard = await leaderboardRepository.findByAssessmentId(assessmentId);

      if (enabled) {
        if (existingLeaderboard) {
          return existingLeaderboard;
        }

        // Create new leaderboard link
        const newLeaderboard = await leaderboardRepository.create({
          assessment: {
            connect: { id: assessmentId },
          },
        });

        logger.info(`Leaderboard connected to assessment: ${assessmentId}`);
        return newLeaderboard;
      } else {
        if (!existingLeaderboard) {
          return null;
        }

        // Remove leaderboard link (cascade deletes entries)
        await leaderboardRepository.delete(existingLeaderboard.id);
        logger.info(`Leaderboard disconnected from assessment: ${assessmentId}`);
        return null;
      }
    } catch (error) {
      logger.error(`Failed to toggle leaderboard for assessment ${assessmentId}:`, error);
      throw error;
    }
  }

  /**
   * Reset leaderboard rankings (Wipe entries)
   */
  async resetLeaderboard(assessmentId: string): Promise<void> {
    try {
      const leaderboard = await leaderboardRepository.findByAssessmentId(assessmentId);
      if (!leaderboard) {
        throw createError.notFound('Leaderboard is not connected to this assessment');
      }

      await leaderboardRepository.resetLeaderboard(leaderboard.id);
      logger.info(`Leaderboard reset for assessment: ${assessmentId}`);
    } catch (error) {
      logger.error(`Failed to reset leaderboard for assessment ${assessmentId}:`, error);
      throw error;
    }
  }

  /**
   * Register candidate participation (join leaderboard with 0 points)
   */
  async participate(assessmentId: string, userId: string): Promise<LeaderboardEntry> {
    try {
      const leaderboard = await leaderboardRepository.findByAssessmentId(assessmentId);
      if (!leaderboard) {
        throw createError.notFound('Leaderboard is not connected to this assessment');
      }

      // Check if user is already participating
      const existingEntry = await leaderboardRepository.findEntry(leaderboard.id, userId);
      if (existingEntry) {
        return existingEntry;
      }

      // Add to leaderboard with 0 points
      const entry = await leaderboardRepository.upsertEntry(leaderboard.id, userId, {
        score: 0,
        timeTaken: 0,
        problemsSolved: 0,
      });

      // Recalculate rankings to assign proper position
      await leaderboardRepository.recalculateRanks(leaderboard.id);

      logger.info(`User ${userId} joined leaderboard for assessment ${assessmentId}`);
      return entry;
    } catch (error) {
      logger.error(`User ${userId} failed to join leaderboard for assessment ${assessmentId}:`, error);
      throw error;
    }
  }

  /**
   * Record a correct answer submission, award points (+4), and update ranks.
   * Deduplicates correct answers to avoid repeated scoring.
   * Ensures the question belongs to the assessment.
   */
  async recordCorrectSubmission(
    assessmentId: string,
    userId: string,
    questionId: string,
    timeTakenSeconds: number
  ): Promise<LeaderboardEntry> {
    try {
      const leaderboard = await leaderboardRepository.findByAssessmentId(assessmentId);
      if (!leaderboard) {
        throw createError.notFound('Leaderboard is not connected to this assessment');
      }

      // 1. Verify the question is assigned to this specific assessment
      const isAssigned = await prisma.assessmentQuestion.findUnique({
        where: {
          assessmentId_questionId: {
            assessmentId,
            questionId,
          },
        },
      });

      if (!isAssigned) {
        throw createError.forbidden('This question is not assigned to this assessment');
      }

      // 2. Check if the candidate has ALREADY solved this question inside this assessment successfully.
      // We check if they have any other successful submissions in the database for this question.
      const alreadySolved = await prisma.submission.findFirst({
        where: {
          userId,
          assessmentId,
          questionId,
          status: 'ACCEPTED',
        },
      });

      let currentEntry = await leaderboardRepository.findEntry(leaderboard.id, userId);

      // If user is not yet registered on the leaderboard, register them
      if (!currentEntry) {
        currentEntry = await leaderboardRepository.upsertEntry(leaderboard.id, userId, {
          score: 0,
          timeTaken: 0,
          problemsSolved: 0,
        });
      }

      if (alreadySolved) {
        // If already solved, update the time taken if it is lower (faster time) or just retain.
        // According to scoring rules, we do not add points (+4) again.
        logger.info(`User ${userId} already solved question ${questionId} in assessment ${assessmentId}. Score unchanged.`);
        return currentEntry;
      }

      // 3. Increment score (+4 points) and problems solved
      const newScore = currentEntry.score + 4;
      const newProblemsSolved = currentEntry.problemsSolved + 1;

      // Cumulative time taken (or updated latest completion time)
      const newTimeTaken = currentEntry.timeTaken + timeTakenSeconds;

      // 4. Update the leaderboard entry
      const updatedEntry = await leaderboardRepository.upsertEntry(leaderboard.id, userId, {
        score: newScore,
        problemsSolved: newProblemsSolved,
        timeTaken: newTimeTaken,
      });

      // 5. Recalculate ranks across all participants in real time
      await leaderboardRepository.recalculateRanks(leaderboard.id);

      logger.info(
        `Leaderboard updated for user ${userId} in assessment ${assessmentId}. New Score: ${newScore}, Problems Solved: ${newProblemsSolved}`
      );

      return updatedEntry;
    } catch (error) {
      logger.error(`Failed to record correct submission for user ${userId} in assessment ${assessmentId}:`, error);
      throw error;
    }
  }

  /**
   * Fetch list of all assessments alongside leaderboard statuses
   */
  async listAllLeaderboards(): Promise<any[]> {
    try {
      const result = await leaderboardRepository.listAllLeaderboards();
      return result;
    } catch (error) {
      logger.error('Failed to list assessments with leaderboards:', error);
      throw error;
    }
  }
}

export const leaderboardService = new LeaderboardService();
