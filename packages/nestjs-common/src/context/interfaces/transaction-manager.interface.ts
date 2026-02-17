import { TransactionInterface } from './transaction.interface';

/**
 * Manages multiple transactions keyed by driver:datasource.
 * Supports nested transactions via push/pop stack per key.
 */
export interface TransactionManagerInterface {
  /**
   * Get the current (top of stack) transaction for the given key.
   */
  get(key: string): TransactionInterface | null;

  /**
   * Push a new transaction onto the stack for the given key.
   * The current transaction (if any) is preserved and can be restored via pop().
   */
  push(key: string, transaction: TransactionInterface): void;

  /**
   * Pop the current transaction for the given key, restoring the previous one.
   */
  pop(key: string): void;

  /**
   * Commit all dirty transactions, rollback clean ones.
   * Only affects current (top of stack) transactions.
   */
  commitAll(): Promise<void>;

  /**
   * Rollback all active transactions.
   * Only affects current (top of stack) transactions.
   */
  rollbackAll(): Promise<void>;
}
