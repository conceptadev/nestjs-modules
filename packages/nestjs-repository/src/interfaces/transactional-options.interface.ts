/**
 * Transaction propagation behaviors
 */
export type PropagationBehavior =
  | 'REQUIRED' // Join existing or create new (default)
  | 'REQUIRES_NEW' // Always create new, suspend existing
  | 'SUPPORTS' // Use existing if available, else non-transactional
  | 'MANDATORY'; // Must have existing, throw if not

/**
 * Options for the `@Transactional` decorator
 */
export interface TransactionalOptions {
  /**
   * Transaction propagation behavior.
   * Defaults to 'REQUIRED'.
   */
  propagation?: PropagationBehavior;

  /**
   * If true, transaction always rolls back (for read-only operations).
   * Defaults to false.
   */
  readOnly?: boolean;

  /**
   * Exception types that should NOT trigger rollback.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  noRollbackFor?: Array<new (...args: any[]) => Error>;

  /**
   * Transaction timeout in milliseconds.
   * Defaults to 30000.
   */
  timeout?: number;
}
