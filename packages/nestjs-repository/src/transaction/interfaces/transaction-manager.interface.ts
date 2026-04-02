import { TransactionInterface } from './transaction.interface';

/**
 * Manages multiple transactions keyed by driver:datasource.
 * Supports nested transactions via push/pop stack per key.
 */
export interface TransactionManagerInterface {
  /**
   * Whether real transaction support is available (factories registered).
   */
  readonly isSupported: boolean;

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

  /**
   * Get the current transaction for the given key, or create one lazily
   * via the factory registry if none exists.
   */
  getOrStart(key: string): Promise<TransactionInterface>;

  /**
   * Register a callback to run after all transactions commit successfully.
   */
  onCommit(fn: () => void | Promise<void>): void;

  /**
   * Register a callback to run after transactions are rolled back.
   */
  onRollback(fn: () => void | Promise<void>): void;

  /**
   * Execute and clear all onCommit callbacks.
   */
  flushOnCommitCallbacks(): Promise<void>;

  /**
   * Execute and clear all onRollback callbacks.
   */
  flushOnRollbackCallbacks(): Promise<void>;
}
