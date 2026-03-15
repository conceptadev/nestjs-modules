import { TransactionScope } from '@concepta/nestjs-repository';

export function createMockTxScope(): jest.Mocked<TransactionScope> {
  const mock = {
    run: jest.fn(),
    onCommit: jest.fn(),
    onRollback: jest.fn(),
    runReadOnly: jest.fn(),
  } as unknown as jest.Mocked<TransactionScope>;

  mock.run.mockImplementation((_ctx, fn) => fn(mock));

  return mock;
}
