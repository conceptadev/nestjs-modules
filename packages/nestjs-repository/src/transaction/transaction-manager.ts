import {
  TransactionInterface,
  TransactionManagerInterface,
} from '@concepta/nestjs-common';

import { TransactionFactoryRegistry } from './transaction-factory-registry';

/**
 * Runtime manager holding active transactions.
 * Supports nested transactions via push/pop stack per key,
 * lazy transaction creation via factory registry,
 * and post-commit/rollback callbacks.
 */
export class TransactionManager implements TransactionManagerInterface {
  private readonly transactions = new Map<string, TransactionInterface>();
  private readonly stack = new Map<string, TransactionInterface[]>();
  private readonly commitCallbacks: (() => void)[] = [];
  private readonly rollbackCallbacks: (() => void)[] = [];

  constructor(private readonly registry: TransactionFactoryRegistry) {}

  get(key: string): TransactionInterface | null {
    return this.transactions.get(key) ?? null;
  }

  /**
   * Get the current transaction for the given key, or create one lazily
   * via the factory registry if none exists.
   */
  async getOrStart(key: string): Promise<TransactionInterface> {
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
   * Push a new transaction onto the stack for the given key.
   * The current transaction (if any) is preserved and can be restored via pop().
   */
  push(key: string, transaction: TransactionInterface): void {
    const current = this.transactions.get(key);
    if (current) {
      if (!this.stack.has(key)) {
        this.stack.set(key, []);
      }
      this.stack.get(key)!.push(current);
    }
    this.transactions.set(key, transaction);
  }

  /**
   * Pop the current transaction for the given key, restoring the previous one.
   */
  pop(key: string): void {
    const stack = this.stack.get(key);
    if (stack?.length) {
      this.transactions.set(key, stack.pop()!);
    } else {
      this.transactions.delete(key);
    }
  }

  /**
   * Commit all dirty transactions, rollback clean ones.
   * Only affects current (top of stack) transactions.
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
   * Only affects current (top of stack) transactions.
   */
  async rollbackAll(): Promise<void> {
    for (const [, tx] of this.transactions) {
      if (tx.isActive) {
        await tx.rollback();
      }
    }
  }

  onCommit(fn: () => void): void {
    this.commitCallbacks.push(fn);
  }

  onRollback(fn: () => void): void {
    this.rollbackCallbacks.push(fn);
  }

  flushOnCommitCallbacks(): void {
    const callbacks = this.commitCallbacks.splice(0);
    for (const fn of callbacks) {
      fn();
    }
  }

  flushOnRollbackCallbacks(): void {
    const callbacks = this.rollbackCallbacks.splice(0);
    for (const fn of callbacks) {
      fn();
    }
  }
}
