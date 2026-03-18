import { TransactionScope } from '../transaction/transaction-scope';

export interface MockTransactionHandle {
  onCommit: jest.Mock;
  onRollback: jest.Mock;
}

/**
 * Create a mock TransactionScope for unit testing.
 *
 * The `run` mock immediately invokes the callback with the handle,
 * simulating synchronous transaction execution.
 */
export function createMockTransaction(): {
  transaction: jest.Mocked<TransactionScope>;
  trxHandle: MockTransactionHandle;
} {
  const trxHandle: MockTransactionHandle = {
    onCommit: jest.fn(),
    onRollback: jest.fn(),
  };

  const transaction = {
    run: jest.fn((_ctx: unknown, fn: (trx: MockTransactionHandle) => unknown) =>
      fn(trxHandle),
    ),
  } as unknown as jest.Mocked<TransactionScope>;

  return { transaction, trxHandle };
}
