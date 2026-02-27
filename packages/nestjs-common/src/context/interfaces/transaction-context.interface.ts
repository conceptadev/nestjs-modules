import { PlainLiteralObject } from '@nestjs/common';

import { TransactionManagerInterface } from '../../repository/interfaces/transaction-manager.interface';

/**
 * Minimal context interface for transaction management.
 *
 * Used by TransactionalRunner and Transaction which only
 * need to read/write the trx field.
 */
export interface TransactionContextInterface extends PlainLiteralObject {
  /**
   * Transaction manager holding active transactions.
   * Mutable so transaction scope can set it.
   */
  trx: TransactionManagerInterface;
}
