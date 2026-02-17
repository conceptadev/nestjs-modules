import {
  TransactionInterface,
  TransactionManagerInterface,
} from '@concepta/nestjs-common';

/**
 * Runtime manager holding active transactions.
 * Supports nested transactions via push/pop stack per key.
 */
export class TransactionManager implements TransactionManagerInterface {
  private readonly transactions = new Map<string, TransactionInterface>();
  private readonly stack = new Map<string, TransactionInterface[]>();

  get(key: string): TransactionInterface | null {
    return this.transactions.get(key) ?? null;
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
}
