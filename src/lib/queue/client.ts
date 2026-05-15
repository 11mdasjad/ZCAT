/**
 * Execution Queue Client
 * Handles adding code execution jobs to the queue
 */

import { logger } from '../logger/logger';
import { env } from '../config/env';

export interface ExecutionJob {
  submissionId: string;
  code: string;
  language: string;
  testCases: Array<{
    id: string;
    input: string;
    expectedOutput: string;
  }>;
  timeLimit: number;
  memoryLimit: number;
}

/**
 * Adds an execution job to the queue
 */
export async function addExecutionJob(job: ExecutionJob): Promise<boolean> {
  try {
    logger.info(`Adding execution job for submission ${job.submissionId}`);
    
    // In a real implementation, this would push to Redis or RabbitMQ
    // Or call a worker service HTTP endpoint
    if (env.EXECUTION_WORKER_URL) {
      const response = await fetch(`${env.EXECUTION_WORKER_URL}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(job),
      });

      if (!response.ok) {
        logger.error('Execution worker rejected job', {
          submissionId: job.submissionId,
          status: response.status,
        });
        return false;
      }
    } else {
      logger.warn('No EXECUTION_WORKER_URL defined, job will be mocked/ignored');
      return false;
    }
    
    return true;
  } catch (error) {
    logger.error('Failed to add execution job to queue:', error);
    return false;
  }
}
