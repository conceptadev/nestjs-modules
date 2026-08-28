import { Logger } from '@nestjs/common';

import { TransactionClosedException } from '../exceptions/transaction-closed.exception.js';
import { type TransactionFactoryInterface } from '../interfaces/transaction-factory.interface.js';

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
  private readonly transactions = new Map<
    string,
    Promise<TransactionInterface>
  >();
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
   *
   * The in-flight promise — not the resolved transaction — is cached, and
   * the cache write happens before anything is awaited. That keeps two
   * concurrent calls for the same key from interleaving: whichever runs
   * first creates and starts the transaction, and the second sees the
   * cached promise and joins it instead of starting a rival one.
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

    const pending = this.startTransaction(factory);
    this.transactions.set(key, pending);

    return pending;
  }

  private async startTransaction(
    factory: TransactionFactoryInterface,
  ): Promise<TransactionInterface> {
    const tx = factory.create();
    await tx.start();
    return tx;
  }

  /**
   * Commit all active transactions.
   */
  async commitAll(): Promise<void> {
    for (const tx of await this.startedTransactions()) {
      if (tx.isActive) {
        await tx.commit();
      }
    }
  }

  /**
   * Rollback all active transactions.
   */
  async rollbackAll(): Promise<void> {
    for (const tx of await this.startedTransactions()) {
      if (tx.isActive) {
        await tx.rollback();
      }
    }
  }

  /**
   * Transactions whose `start()` actually succeeded. A key whose `start()`
   * rejected never began, so there is nothing to commit or roll back for
   * it — surfacing that rejection here would replace the caller's real
   * error instead of the one that led to settlement.
   */
  private async startedTransactions(): Promise<TransactionInterface[]> {
    const results = await Promise.allSettled(this.transactions.values());
    return results.flatMap((result) =>
      result.status === 'fulfilled' ? [result.value] : [],
    );
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
