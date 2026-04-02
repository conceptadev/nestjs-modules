import { AppContextHost } from '@concepta/nestjs-common';

import {
  TransactionContextInterface,
  TrxCtx,
} from '../transaction/interfaces/transaction-context.interface';
import { TransactionScope } from '../transaction/transaction-scope';

export interface MockTransactionHandle {
  onCommit: jest.Mock;
  onRollback: jest.Mock;
}

/**
 * Create a mock TransactionScope for unit testing.
 *
 * The `run` mock immediately invokes the callback with a mock
 * `TransactionContextInterface` backed by a real `AppContextHost`
 * so that nested `AppContextHost.from()` calls work correctly.
 */
export function createMockTransaction(): {
  transaction: jest.Mocked<TransactionScope>;
  trxHandle: MockTransactionHandle;
} {
  const trxHandle: MockTransactionHandle = {
    onCommit: jest.fn(),
    onRollback: jest.fn(),
  };

  const mockHost = new AppContextHost();
  mockHost.defineOverlay(TrxCtx, {
    trx: trxHandle,
  } as unknown as TransactionContextInterface);
  const mockTxCtx = mockHost.with(TrxCtx);

  const transaction = {
    run: jest.fn(
      (_ctx: unknown, fn: (txCtx: TransactionContextInterface) => unknown) =>
        fn(mockTxCtx),
    ),
  } as unknown as jest.Mocked<TransactionScope>;

  return { transaction, trxHandle };
}
