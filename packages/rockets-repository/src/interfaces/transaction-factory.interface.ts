import { TransactionInterface } from '../transaction/interfaces/transaction.interface';

/**
 * Factory for creating transactions.
 * Each driver/datasource provides its own factory implementation.
 */
export interface TransactionFactoryInterface {
  create(): TransactionInterface;
}
