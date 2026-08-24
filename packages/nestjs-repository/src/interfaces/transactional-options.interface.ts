/**
 * Transaction propagation behaviors
 */
export type PropagationBehavior =
  | 'SUPPORTS' // Run full lifecycle; commitAll/rollbackAll are no-ops when unsupported (default)
  | 'MANDATORY'; // Require real transaction support, throw if not

/**
 * Options for the `@Transactional` decorator
 */
export interface TransactionalOptions {
  /**
   * Transaction propagation behavior.
   * Defaults to 'SUPPORTS'.
   */
  propagation?: PropagationBehavior;

  /**
   * If true, transaction always rolls back (for read-only operations).
   * Defaults to false.
   */
  readOnly?: boolean;

  /**
   * Transaction timeout in milliseconds.
   * Defaults to 30000.
   */
  timeout?: number;
}
