import { DataSource, QueryRunner, EntityManager } from 'typeorm';

import { TransactionInterface } from '@concepta/rockets-repository';

/**
 * TypeORM implementation of a transaction.
 *
 * Wraps a TypeORM QueryRunner to manage transaction lifecycle. Each instance
 * represents a single transaction that can be started, committed, or rolled back.
 *
 * The `isDirty` flag tracks whether any write operations have occurred within
 * the transaction. This allows the transaction manager to skip commits for
 * read-only transactions.
 *
 * @example
 * ```typescript
 * const tx = new TypeOrmTransaction(dataSource);
 * await tx.start();
 *
 * const manager = tx.getClient<EntityManager>();
 * await manager.save(entity);
 * tx.markDirty();
 *
 * await tx.commit();
 * ```
 */
export class TypeOrmTransaction implements TransactionInterface {
  private queryRunner: QueryRunner | null = null;
  private _isDirty = false;

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Whether the transaction is currently active.
   */
  get isActive(): boolean {
    return this.queryRunner?.isTransactionActive ?? false;
  }

  /**
   * Whether any write operations have occurred within this transaction.
   */
  get isDirty(): boolean {
    return this._isDirty;
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
   * Mark the transaction as dirty, indicating write operations have occurred.
   */
  markDirty(): void {
    this._isDirty = true;
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
    this._isDirty = false;
  }
}
