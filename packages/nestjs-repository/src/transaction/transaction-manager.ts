import { Logger } from '@nestjs/common';

import { TransactionClosedException } from '../exceptions/transaction-closed.exception.js';

import { type TransactionManagerInterface } from './interfaces/transaction-manager.interface.js';
import { type TransactionInterface } from './interfaces/transaction.interface.js';
import { type TransactionFactoryRegistry } from './transaction-factory-registry.js';

/**
 * Runtime manager holding the transactions (one per driver:datasource key)
 * for a single {@link TransactionScope.run} scope, lazy transaction
 * creation via factory registry, and post-commit/rollback callbacks.
 *
 * Also owns that scope's lifecycle: `enter()`/`exit()` refcount concurrent
 * `run()` calls sharing the same scope, and `close()` permanently closes it
 * once settled so a stale handle fails loudly via `getOrStart` instead of
 * silently falling through to non-transactional access.
 */
export class TransactionManager implements TransactionManagerInterface {
  private readonly transactions = new Map<string, TransactionInterface>();
  private readonly commitCallbacks: (() => void | Promise<void>)[] = [];
  private readonly rollbackCallbacks: (() => void | Promise<void>)[] = [];
  private depth = 0;
  private closed = false;
  private failed = false;

  constructor(
    private readonly registry: TransactionFactoryRegistry,
    private readonly readOnly: boolean = false,
  ) {}

  get isSupported(): boolean {
    return this.registry.count > 0;
  }

  get isReadOnly(): boolean {
    return this.readOnly;
  }

  get isClosed(): boolean {
    return this.closed;
  }

  get hasFailed(): boolean {
    return this.failed;
  }

  get(key: string): TransactionInterface | null {
    return this.transactions.get(key) ?? null;
  }

  enter(): number {
    return ++this.depth;
  }

  exit(): number {
    return --this.depth;
  }

  markFailed(): void {
    this.failed = true;
  }

  close(): void {
    this.closed = true;
  }

  /**
   * Get the current transaction for the given key, or create one lazily
   * via the factory registry if none exists.
   */
  async getOrStart(key: string): Promise<TransactionInterface> {
    if (this.closed) {
      throw new TransactionClosedException();
    }

    const existing = this.transactions.get(key);
    if (existing) {
      return existing;
    }

    const factory = this.registry.get(key);
    if (!factory) {
      throw new Error(`No transaction factory registered for key "${key}"`);
    }

    const tx = factory.create();
    await tx.start();
    this.transactions.set(key, tx);

    return tx;
  }

  /**
   * Commit all dirty transactions, rollback clean ones.
   */
  async commitAll(): Promise<void> {
    for (const [, tx] of this.transactions) {
      if (tx.isActive) {
        if (tx.isDirty) {
          await tx.commit();
        } else {
          await tx.rollback();
        }
      }
    }
  }

  /**
   * Rollback all active transactions.
   */
  async rollbackAll(): Promise<void> {
    for (const [, tx] of this.transactions) {
      if (tx.isActive) {
        await tx.rollback();
      }
    }
  }

  onCommit(fn: () => void | Promise<void>): void {
    this.commitCallbacks.push(fn);
  }

  onRollback(fn: () => void | Promise<void>): void {
    this.rollbackCallbacks.push(fn);
  }

  async flushOnCommitCallbacks(): Promise<void> {
    const callbacks = this.commitCallbacks.splice(0);

    const results = await Promise.allSettled(callbacks.map(async (cb) => cb()));

    results.forEach((result) => {
      if (result.status === 'rejected') {
        Logger.error(
          `Transaction onCommit Callback Error: ${result.reason}`,
          result.reason.stack,
        );
      }
    });
  }

  async flushOnRollbackCallbacks(): Promise<void> {
    const callbacks = this.rollbackCallbacks.splice(0);

    const results = await Promise.allSettled(callbacks.map(async (cb) => cb()));

    results.forEach((result) => {
      if (result.status === 'rejected') {
        Logger.error(
          `Transaction onRollback Callback Error: ${result.reason}`,
          result.reason.stack,
        );
      }
    });
  }
}
