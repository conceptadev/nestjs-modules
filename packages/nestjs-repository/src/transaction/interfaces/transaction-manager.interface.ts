import { type TransactionInterface } from './transaction.interface.js';

/**
 * Manages the transactions (one per driver:datasource key) that belong to
 * a single {@link TransactionScope.run} scope, plus that scope's own
 * lifecycle (entry/exit refcount, settled state).
 */
export interface TransactionManagerInterface {
  /**
   * Whether real transaction support is available (factories registered).
   */
  readonly isSupported: boolean;

  /**
   * Whether this scope was opened with `readOnly: true`.
   */
  readonly isReadOnly: boolean;

  /**
   * Whether the scope has settled (committed or rolled back) and can no
   * longer be used.
   */
  readonly isClosed: boolean;

  /**
   * Whether the scope's operation has thrown.
   */
  readonly hasFailed: boolean;

  /**
   * Mark that a `run()` call has entered this scope. Returns the resulting
   * depth.
   */
  enter(): number;

  /**
   * Mark that a `run()` call has exited this scope. Returns the resulting
   * depth — the scope should settle when this reaches 0.
   */
  exit(): number;

  /**
   * Mark the scope's operation as having thrown.
   */
  markFailed(): void;

  /**
   * Close the scope. Once closed, `getOrStart` throws.
   */
  close(): void;

  /**
   * Commit all active transactions.
   */
  commitAll(): Promise<void>;

  /**
   * Rollback all active transactions.
   */
  rollbackAll(): Promise<void>;

  /**
   * Get the current transaction for the given key, or create one lazily
   * via the factory registry if none exists. Throws once the scope is
   * closed.
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
