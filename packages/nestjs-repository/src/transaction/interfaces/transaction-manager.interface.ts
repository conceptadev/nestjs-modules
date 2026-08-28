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
   * Commit all active transactions, sequentially, stopping at the first
   * failure. Transactions that haven't committed yet at that point are
   * rolled back rather than abandoned. Throws the raw underlying error for
   * a single datasource, or `TransactionHeuristicCommitException` when more
   * than one is involved, since a partial commit across datasources leaves
   * an inherently mixed outcome that can't be undone without real 2PC.
   */
  commitAll(): Promise<void>;

  /**
   * Rollback all active transactions. Every one is attempted even if an
   * earlier one fails — a failure is logged, not thrown, so it never
   * abandons the rest or replaces an error the caller is already handling.
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
   * Register a callback to run after transactions are rolled back. A
   * `readOnly` scope always rolls back, so these run whether or not its
   * operation succeeded.
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
