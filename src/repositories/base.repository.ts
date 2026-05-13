/**
 * Base Repository
 * Generic repository pattern with common CRUD operations
 */

import prisma from '@/lib/prisma/client';
import { Prisma } from '@prisma/client';
import { DatabaseError, NotFoundError } from '@/lib/errors/app-error';
import { logger } from '@/lib/logger/logger';

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}

export abstract class BaseRepository<T, CreateInput, UpdateInput> {
  protected abstract modelName: Prisma.ModelName;

  /**
   * Get Prisma delegate for the model
   */
  protected get model(): any {
    return (prisma as any)[this.modelName.toLowerCase()];
  }

  /**
   * Find by ID
   */
  async findById(id: string, include?: any): Promise<T | null> {
    try {
      return await this.model.findUnique({
        where: { id },
        include,
      });
    } catch (error) {
      logger.error(`Error finding ${this.modelName} by ID:`, error);
      throw new DatabaseError(`Failed to find ${this.modelName}`);
    }
  }

  /**
   * Find by ID or throw
   */
  async findByIdOrThrow(id: string, include?: any): Promise<T> {
    const entity = await this.findById(id, include);
    
    if (!entity) {
      throw new NotFoundError(this.modelName);
    }
    
    return entity;
  }

  /**
   * Find all with optional filters
   */
  async findAll(where?: any, include?: any, orderBy?: any): Promise<T[]> {
    try {
      return await this.model.findMany({
        where,
        include,
        orderBy,
      });
    } catch (error) {
      logger.error(`Error finding all ${this.modelName}:`, error);
      throw new DatabaseError(`Failed to find ${this.modelName}s`);
    }
  }

  /**
   * Find with pagination
   */
  async findPaginated(
    options: PaginationOptions,
    where?: any,
    include?: any,
    orderBy?: any
  ): Promise<PaginatedResult<T>> {
    try {
      const { page, limit } = options;
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.model.findMany({
          where,
          include,
          orderBy,
          skip,
          take: limit,
        }),
        this.model.count({ where }),
      ]);

      return {
        data,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error(`Error finding paginated ${this.modelName}:`, error);
      throw new DatabaseError(`Failed to find ${this.modelName}s`);
    }
  }

  /**
   * Find one by criteria
   */
  async findOne(where: any, include?: any): Promise<T | null> {
    try {
      return await this.model.findFirst({
        where,
        include,
      });
    } catch (error) {
      logger.error(`Error finding ${this.modelName}:`, error);
      throw new DatabaseError(`Failed to find ${this.modelName}`);
    }
  }

  /**
   * Create entity
   */
  async create(data: CreateInput, include?: any): Promise<T> {
    try {
      return await this.model.create({
        data,
        include,
      });
    } catch (error) {
      logger.error(`Error creating ${this.modelName}:`, error);
      throw new DatabaseError(`Failed to create ${this.modelName}`);
    }
  }

  /**
   * Create many entities
   */
  async createMany(data: CreateInput[]): Promise<{ count: number }> {
    try {
      return await this.model.createMany({
        data,
        skipDuplicates: true,
      });
    } catch (error) {
      logger.error(`Error creating many ${this.modelName}:`, error);
      throw new DatabaseError(`Failed to create ${this.modelName}s`);
    }
  }

  /**
   * Update entity
   */
  async update(id: string, data: UpdateInput, include?: any): Promise<T> {
    try {
      return await this.model.update({
        where: { id },
        data,
        include,
      });
    } catch (error) {
      logger.error(`Error updating ${this.modelName}:`, error);
      throw new DatabaseError(`Failed to update ${this.modelName}`);
    }
  }

  /**
   * Update many entities
   */
  async updateMany(where: any, data: Partial<UpdateInput>): Promise<{ count: number }> {
    try {
      return await this.model.updateMany({
        where,
        data,
      });
    } catch (error) {
      logger.error(`Error updating many ${this.modelName}:`, error);
      throw new DatabaseError(`Failed to update ${this.modelName}s`);
    }
  }

  /**
   * Delete entity (hard delete)
   */
  async delete(id: string): Promise<T> {
    try {
      return await this.model.delete({
        where: { id },
      });
    } catch (error) {
      logger.error(`Error deleting ${this.modelName}:`, error);
      throw new DatabaseError(`Failed to delete ${this.modelName}`);
    }
  }

  /**
   * Soft delete entity
   */
  async softDelete(id: string): Promise<T> {
    try {
      return await this.model.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error) {
      logger.error(`Error soft deleting ${this.modelName}:`, error);
      throw new DatabaseError(`Failed to delete ${this.modelName}`);
    }
  }

  /**
   * Delete many entities
   */
  async deleteMany(where: any): Promise<{ count: number }> {
    try {
      return await this.model.deleteMany({
        where,
      });
    } catch (error) {
      logger.error(`Error deleting many ${this.modelName}:`, error);
      throw new DatabaseError(`Failed to delete ${this.modelName}s`);
    }
  }

  /**
   * Count entities
   */
  async count(where?: any): Promise<number> {
    try {
      return await this.model.count({ where });
    } catch (error) {
      logger.error(`Error counting ${this.modelName}:`, error);
      throw new DatabaseError(`Failed to count ${this.modelName}s`);
    }
  }

  /**
   * Check if entity exists
   */
  async exists(where: any): Promise<boolean> {
    try {
      const count = await this.model.count({ where });
      return count > 0;
    } catch (error) {
      logger.error(`Error checking ${this.modelName} existence:`, error);
      throw new DatabaseError(`Failed to check ${this.modelName} existence`);
    }
  }

  /**
   * Execute raw query
   */
  async executeRaw(query: string, params?: any[]): Promise<any> {
    try {
      return await prisma.$queryRawUnsafe(query, ...(params || []));
    } catch (error) {
      logger.error(`Error executing raw query:`, error);
      throw new DatabaseError('Failed to execute query');
    }
  }

  /**
   * Transaction wrapper
   */
  async transaction<R>(
    callback: (tx: Prisma.TransactionClient) => Promise<R>
  ): Promise<R> {
    try {
      return await prisma.$transaction(callback);
    } catch (error) {
      logger.error(`Error in transaction:`, error);
      throw new DatabaseError('Transaction failed');
    }
  }
}
