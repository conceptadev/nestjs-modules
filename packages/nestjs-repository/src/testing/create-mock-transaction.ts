import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

import { AppContextHost } from '@concepta/rockets-app';

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
  transaction: DeepMockProxy<TransactionScope>;
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

  const transaction = mockDeep<TransactionScope>();
  transaction.run.mockImplementation((_ctx, fn) => fn(mockTxCtx));

  return { transaction, trxHandle };
}
