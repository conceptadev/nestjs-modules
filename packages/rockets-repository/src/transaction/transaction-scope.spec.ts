import { Test, TestingModule } from '@nestjs/testing';

import { AppContextHost } from '@concepta/rockets-app';

import { TransactionRequiredException } from '../exceptions/transaction-required.exception';
import { TransactionTimeoutException } from '../exceptions/transaction-timeout.exception';
import { REPOSITORY_MODULE_OPTIONS } from '../repository.constants';

import { TransactionContextInterface } from './interfaces/transaction-context.interface';
import { TransactionInterface } from './interfaces/transaction.interface';
import {
  TransactionFactoryRegistry,
  TRANSACTION_FACTORY_REGISTRY,
} from './transaction-factory-registry';
import { TransactionScope } from './transaction-scope';

describe(TransactionScope.name, () => {
  let transaction: TransactionScope;
  let mockRegistry: TransactionFactoryRegistry;

  const createMockTransaction = (): TransactionInterface => {
    let isActive = false;
    let isDirty = false;

    return {
      get isActive() {
        return isActive;
      },
      get isDirty() {
        return isDirty;
      },
      start: jest.fn().mockImplementation(async () => {
        isActive = true;
      }),
      commit: jest.fn().mockImplementation(async () => {
        isActive = false;
      }),
      rollback: jest.fn().mockImplementation(async () => {
        isActive = false;
      }),
      markDirty: jest.fn().mockImplementation(() => {
        isDirty = true;
      }),
      getClient: jest.fn(),
    };
  };

  beforeEach(async () => {
    mockRegistry = new TransactionFactoryRegistry();
    mockRegistry.register('default', { create: createMockTransaction });

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionScope,
        {
          provide: TRANSACTION_FACTORY_REGISTRY,
          useValue: mockRegistry,
        },
        {
          provide: REPOSITORY_MODULE_OPTIONS,
          useValue: { defaultTimeout: 30000 },
        },
      ],
    }).compile();

    transaction = moduleRef.get<TransactionScope>(TransactionScope);
  });

  describe('run with SUPPORTS propagation (default)', () => {
    it('should auto-define TrxCtx and run lifecycle', async () => {
      const ctx = new AppContextHost();
      const operation = jest.fn().mockResolvedValue('result');

      const result = await transaction.run(ctx, operation);

      expect(result).toBe('result');
      expect(operation).toHaveBeenCalledWith(
        expect.objectContaining({
          trx: expect.objectContaining({
            onCommit: expect.any(Function),
            onRollback: expect.any(Function),
          }),
        }),
      );
    });

    it('should accept a plain object and coerce via AppContextHost.from()', async () => {
      const ctx = {};
      const operation = jest.fn().mockResolvedValue('result');

      const result = await transaction.run(ctx, operation);

      expect(result).toBe('result');
      expect(operation).toHaveBeenCalled();
    });

    it('should detect nested call via supports(TrxCtx)', async () => {
      const ctx = new AppContextHost();

      await transaction.run(ctx, async () => {
        // TrxCtx is now defined — nested run should join
        const innerResult = await transaction.run(ctx, async () => 'inner');
        expect(innerResult).toBe('inner');
        return 'outer';
      });
    });

    it('should run lifecycle even without factories registered', async () => {
      const emptyRegistry = new TransactionFactoryRegistry();
      const moduleRef = await Test.createTestingModule({
        providers: [
          TransactionScope,
          {
            provide: TRANSACTION_FACTORY_REGISTRY,
            useValue: emptyRegistry,
          },
          {
            provide: REPOSITORY_MODULE_OPTIONS,
            useValue: { defaultTimeout: 30000 },
          },
        ],
      }).compile();

      const txScope = moduleRef.get<TransactionScope>(TransactionScope);
      const ctx = new AppContextHost();

      const operation = jest.fn().mockResolvedValue('result');
      const result = await txScope.run(ctx, operation);

      expect(result).toBe('result');
      expect(operation).toHaveBeenCalled();
    });
  });

  describe('run with MANDATORY propagation', () => {
    it('should run when factories are registered', async () => {
      const ctx = new AppContextHost();
      const operation = jest.fn().mockResolvedValue('result');

      const result = await transaction.run(ctx, operation, {
        propagation: 'MANDATORY',
      });

      expect(result).toBe('result');
    });

    it('should throw when no factories are registered', async () => {
      const emptyRegistry = new TransactionFactoryRegistry();
      const moduleRef = await Test.createTestingModule({
        providers: [
          TransactionScope,
          {
            provide: TRANSACTION_FACTORY_REGISTRY,
            useValue: emptyRegistry,
          },
          {
            provide: REPOSITORY_MODULE_OPTIONS,
            useValue: { defaultTimeout: 30000 },
          },
        ],
      }).compile();

      const txScope = moduleRef.get<TransactionScope>(TransactionScope);
      const ctx = new AppContextHost();

      const operation = jest.fn().mockResolvedValue('result');

      await expect(
        txScope.run(ctx, operation, { propagation: 'MANDATORY' }),
      ).rejects.toThrow(TransactionRequiredException);

      expect(operation).not.toHaveBeenCalled();
    });
  });

  describe('commit and rollback lifecycle', () => {
    it('should commit dirty transactions on success', async () => {
      const mockTx = createMockTransaction();
      mockRegistry.register('typeorm:default', { create: () => mockTx });

      const ctx = new AppContextHost();

      await transaction.run(ctx, async (txCtx: TransactionContextInterface) => {
        const tx = await txCtx.trx.getOrStart('typeorm:default');
        tx?.markDirty();
        return 'result';
      });

      expect(mockTx.start).toHaveBeenCalledTimes(1);
      expect(mockTx.commit).toHaveBeenCalledTimes(1);
      expect(mockTx.rollback).not.toHaveBeenCalled();
    });

    it('should rollback clean transactions on success', async () => {
      const mockTx = createMockTransaction();
      mockRegistry.register('typeorm:default', { create: () => mockTx });

      const ctx = new AppContextHost();

      await transaction.run(ctx, async (txCtx: TransactionContextInterface) => {
        await txCtx.trx.getOrStart('typeorm:default');
        return 'result';
      });

      expect(mockTx.rollback).toHaveBeenCalledTimes(1);
      expect(mockTx.commit).not.toHaveBeenCalled();
    });

    it('should rollback all on error', async () => {
      const mockTx = createMockTransaction();
      mockRegistry.register('typeorm:default', { create: () => mockTx });

      const ctx = new AppContextHost();
      const error = new Error('Operation failed');

      await expect(
        transaction.run(ctx, async (txCtx: TransactionContextInterface) => {
          await txCtx.trx.getOrStart('typeorm:default');
          throw error;
        }),
      ).rejects.toThrow(error);

      expect(mockTx.rollback).toHaveBeenCalledTimes(1);
    });
  });

  describe('readOnly transactions', () => {
    it('should rollback on success when readOnly=true', async () => {
      const mockTx = createMockTransaction();
      mockRegistry.register('typeorm:default', { create: () => mockTx });

      const ctx = new AppContextHost();

      await transaction.run(
        ctx,
        async (txCtx: TransactionContextInterface) => {
          const tx = await txCtx.trx.getOrStart('typeorm:default');
          tx?.markDirty();
          return 'result';
        },
        { readOnly: true },
      );

      expect(mockTx.rollback).toHaveBeenCalledTimes(1);
      expect(mockTx.commit).not.toHaveBeenCalled();
    });

    it('runReadOnly should set readOnly=true', async () => {
      const mockTx = createMockTransaction();
      mockRegistry.register('typeorm:default', { create: () => mockTx });

      const ctx = new AppContextHost();

      await transaction.runReadOnly(
        ctx,
        async (txCtx: TransactionContextInterface) => {
          await txCtx.trx.getOrStart('typeorm:default');
          return 'result';
        },
      );

      expect(mockTx.rollback).toHaveBeenCalledTimes(1);
      expect(mockTx.commit).not.toHaveBeenCalled();
    });
  });

  describe('timeout handling', () => {
    it('should throw TransactionTimeoutException on timeout', async () => {
      const ctx = new AppContextHost();
      const operation = jest
        .fn()
        .mockImplementation(
          async () => new Promise((resolve) => setTimeout(resolve, 200)),
        );

      await expect(
        transaction.run(ctx, operation, { timeout: 50 }),
      ).rejects.toThrow(TransactionTimeoutException);
    });
  });

  describe('onCommit / onRollback callbacks', () => {
    it('should flush onCommit callbacks after successful commit', async () => {
      const ctx = new AppContextHost();
      const callback = jest.fn();

      await transaction.run(ctx, async (txCtx: TransactionContextInterface) => {
        txCtx.trx.onCommit(callback);
        return 'result';
      });

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should flush onRollback callbacks after error rollback', async () => {
      const ctx = new AppContextHost();
      const callback = jest.fn();

      await expect(
        transaction.run(ctx, async (txCtx: TransactionContextInterface) => {
          txCtx.trx.onRollback(callback);
          throw new Error('fail');
        }),
      ).rejects.toThrow('fail');

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should not flush onCommit callbacks on rollback', async () => {
      const ctx = new AppContextHost();
      const commitCb = jest.fn();

      await expect(
        transaction.run(ctx, async (txCtx: TransactionContextInterface) => {
          txCtx.trx.onCommit(commitCb);
          throw new Error('fail');
        }),
      ).rejects.toThrow('fail');

      expect(commitCb).not.toHaveBeenCalled();
    });

    it('should not flush onRollback callbacks on commit', async () => {
      const ctx = new AppContextHost();
      const rollbackCb = jest.fn();

      await transaction.run(ctx, async (txCtx: TransactionContextInterface) => {
        txCtx.trx.onRollback(rollbackCb);
        return 'result';
      });

      expect(rollbackCb).not.toHaveBeenCalled();
    });

    it('should accumulate callbacks from nested runs and flush at outermost', async () => {
      const ctx = new AppContextHost();
      const order: number[] = [];

      await transaction.run(ctx, async (txCtx: TransactionContextInterface) => {
        txCtx.trx.onCommit(() => {
          order.push(1);
        });

        await transaction.run(
          ctx,
          async (innerTxCtx: TransactionContextInterface) => {
            innerTxCtx.trx.onCommit(() => {
              order.push(2);
            });
            return 'inner';
          },
        );

        txCtx.trx.onCommit(() => {
          order.push(3);
        });
        return 'outer';
      });

      expect(order).toEqual([1, 2, 3]);
    });
  });

  describe('nested run() calls', () => {
    it('should not double commit on nested run', async () => {
      const mockTx = createMockTransaction();
      mockRegistry.register('typeorm:default', { create: () => mockTx });

      const ctx = new AppContextHost();

      await transaction.run(ctx, async (txCtx: TransactionContextInterface) => {
        const tx = await txCtx.trx.getOrStart('typeorm:default');
        tx?.markDirty();

        // Nested run — should just execute, no lifecycle ownership
        await transaction.run(ctx, async () => 'inner');

        return 'outer';
      });

      // Only committed once by outermost
      expect(mockTx.commit).toHaveBeenCalledTimes(1);
    });

    it('should propagate error from nested run to outermost', async () => {
      const mockTx = createMockTransaction();
      mockRegistry.register('typeorm:default', { create: () => mockTx });

      const ctx = new AppContextHost();
      const error = new Error('inner failure');

      await expect(
        transaction.run(ctx, async (txCtx: TransactionContextInterface) => {
          await txCtx.trx.getOrStart('typeorm:default');

          await transaction.run(ctx, async () => {
            throw error;
          });

          return 'outer';
        }),
      ).rejects.toThrow(error);

      expect(mockTx.rollback).toHaveBeenCalledTimes(1);
    });
  });
});
