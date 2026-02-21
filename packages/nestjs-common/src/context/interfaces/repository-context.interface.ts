import { HookContextInterface } from './hook-context.interface';
import { TransactionContextInterface } from './transaction-context.interface';

/**
 * Context interface for repository operations.
 *
 * Extends TransactionContextInterface for transaction support
 * and HookContextInterface for hook access.
 */
export interface RepositoryContextInterface
  extends TransactionContextInterface,
    HookContextInterface {
  /**
   * Entity key used to resolve the correct repository.
   */
  entity: string;
}
