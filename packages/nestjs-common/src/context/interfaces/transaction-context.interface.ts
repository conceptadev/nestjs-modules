import { TransactionManagerInterface } from './transaction-manager.interface';

/**
 * Minimal context interface for transaction management.
 *
 * Used by TransactionalRunner and TransactionScope which only
 * need to read/write the trx field.
 */
export interface TransactionContextInterface {
  /**
   * Transaction manager holding active transactions.
   * Mutable so transaction scope can set it.
   */
  trx: TransactionManagerInterface | null;
}
