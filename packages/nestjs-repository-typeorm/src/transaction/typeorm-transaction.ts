import { type DataSource, type QueryRunner, type EntityManager } from 'typeorm';

import { type TransactionInterface } from '@concepta/nestjs-repository';

/**
 * TypeORM implementation of a transaction.
 *
 * Wraps a TypeORM QueryRunner to manage transaction lifecycle. Each instance
 * represents a single transaction that can be started, committed, or rolled back.
 *
 * @example
 * ```typescript
 * const tx = new TypeOrmTransaction(dataSource);
 * await tx.start();
 *
 * const manager = tx.getClient<EntityManager>();
 * await manager.save(entity);
 *
 * await tx.commit();
 * ```
 */
export class TypeOrmTransaction implements TransactionInterface {
  private queryRunner: QueryRunner | null = null;

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Whether the transaction is currently active.
   */
  get isActive(): boolean {
    return this.queryRunner?.isTransactionActive ?? false;
  }

  /**
   * Start the transaction by creating a QueryRunner and beginning a transaction.
   */
  async start(): Promise<void> {
    this.queryRunner = this.dataSource.createQueryRunner();
    await this.queryRunner.connect();
    await this.queryRunner.startTransaction();
  }

  /**
   * Commit the transaction and release the QueryRunner.
   */
  async commit(): Promise<void> {
    if (!this.queryRunner) {
      throw new Error('No active transaction to commit');
    }

    try {
      await this.queryRunner.commitTransaction();
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Rollback the transaction and release the QueryRunner.
   * Safe to call even if no transaction is active.
   */
  async rollback(): Promise<void> {
    if (!this.queryRunner) {
      return;
    }

    try {
      if (this.queryRunner.isTransactionActive) {
        await this.queryRunner.rollbackTransaction();
      }
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Get the EntityManager for this transaction.
   */
  getClient<T = EntityManager>(): T {
    if (!this.queryRunner?.manager) {
      throw new Error('No active transaction - cannot get client');
    }
    return this.queryRunner.manager as T;
  }

  private async cleanup(): Promise<void> {
    if (this.queryRunner) {
      await this.queryRunner.release();
      this.queryRunner = null;
    }
  }
}
