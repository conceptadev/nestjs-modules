import { Test, TestingModule } from '@nestjs/testing';

import { AppContextHost } from '@concepta/nestjs-common';

import { TransactionContextInterface } from '../context/interfaces/transaction-context.interface';
import { TransactionRequiredException } from '../exceptions/transaction-required.exception';
import { TransactionTimeoutException } from '../exceptions/transaction-timeout.exception';
import { REPOSITORY_MODULE_OPTIONS } from '../repository.constants';

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

  const createCtx = () =>
    AppContextHost.merge<TransactionContextInterface>(() => ({}));

  beforeEach(async () => {
    mockRegistry = new TransactionFactoryRegistry();

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

  describe('run with REQUIRED propagation (default)', () => {
    it('should create manager and register on context when no existing trx', async () => {
      const ctx = createCtx();
      const operation = jest.fn().mockResolvedValue('result');

      const result = await transaction.run(ctx, operation);

      expect(result).toBe('result');
      expect(ctx.has('trx')).toBe(true);
      expect(operation).toHaveBeenCalledWith(transaction);
    });

    it('should create manager when ctx is undefined', async () => {
      const operation = jest.fn().mockResolvedValue('result');

      const result = await transaction.run({}, operation);

      expect(result).toBe('result');
      expect(operation).toHaveBeenCalledWith(transaction);
    });

    it('should join existing transaction without creating new manager', async () => {
      const ctx = createCtx();

      // Simulate outermost run registering trx
      await transaction.run(ctx, async () => {
        // Nested run should join
        const innerResult = await transaction.run(ctx, async () => 'inner');
        expect(innerResult).toBe('inner');
        return 'outer';
      });
    });
  });

  describe('run with SUPPORTS propagation', () => {
    it('should use existing transaction if available', async () => {
      const ctx = createCtx();

      await transaction.run(ctx, async () => {
        const result = await transaction.run(ctx, async () => 'supported', {
          propagation: 'SUPPORTS',
        });
        expect(result).toBe('supported');
        return 'outer';
      });
    });

    it('should run without transaction if none exists', async () => {
      const ctx = createCtx();
      const operation = jest.fn().mockResolvedValue('result');

      const result = await transaction.run(ctx, operation, {
        propagation: 'SUPPORTS',
      });

      expect(result).toBe('result');
      expect(ctx.has('trx')).toBe(false);
      expect(operation).toHaveBeenCalledWith(transaction);
    });

    it('should run without transaction when ctx is undefined', async () => {
      const operation = jest.fn().mockResolvedValue('result');

      const result = await transaction.run({}, operation, {
        propagation: 'SUPPORTS',
      });

      expect(result).toBe('result');
      expect(operation).toHaveBeenCalledWith(transaction);
    });
  });

  describe('run with MANDATORY propagation', () => {
    it('should use existing transaction', async () => {
      const ctx = createCtx();

      await transaction.run(ctx, async () => {
        const result = await transaction.run(ctx, async () => 'mandatory', {
          propagation: 'MANDATORY',
        });
        expect(result).toBe('mandatory');
        return 'outer';
      });
    });

    it('should throw if no existing transaction', async () => {
      const ctx = createCtx();
      const operation = jest.fn().mockResolvedValue('result');

      await expect(
        transaction.run(ctx, operation, { propagation: 'MANDATORY' }),
      ).rejects.toThrow(TransactionRequiredException);

      expect(operation).not.toHaveBeenCalled();
    });

    it('should throw when ctx is undefined', async () => {
      const operation = jest.fn().mockResolvedValue('result');

      await expect(
        transaction.run({}, operation, { propagation: 'MANDATORY' }),
      ).rejects.toThrow(TransactionRequiredException);

      expect(operation).not.toHaveBeenCalled();
    });
  });

  describe('commit and rollback lifecycle', () => {
    it('should commit dirty transactions on success', async () => {
      const mockTx = createMockTransaction();
      mockRegistry.register('typeorm:default', { create: () => mockTx });

      const ctx = createCtx();

      await transaction.run(ctx, async () => {
        // Simulate repo accessing the transaction lazily
        const trxManager = ctx.trx!;
        const tx = await trxManager.getOrStart('typeorm:default');
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

      const ctx = createCtx();

      await transaction.run(ctx, async () => {
        const trxManager = ctx.trx!;
        await trxManager.getOrStart('typeorm:default');
        return 'result';
      });

      expect(mockTx.rollback).toHaveBeenCalledTimes(1);
      expect(mockTx.commit).not.toHaveBeenCalled();
    });

    it('should rollback all on error', async () => {
      const mockTx = createMockTransaction();
      mockRegistry.register('typeorm:default', { create: () => mockTx });

      const ctx = createCtx();
      const error = new Error('Operation failed');

      await expect(
        transaction.run(ctx, async () => {
          const trxManager = ctx.trx!;
          await trxManager.getOrStart('typeorm:default');
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

      const ctx = createCtx();

      await transaction.run(
        ctx,
        async () => {
          const trxManager = ctx.trx!;
          const tx = await trxManager.getOrStart('typeorm:default');
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

      const ctx = createCtx();

      await transaction.runReadOnly(ctx, async () => {
        const trxManager = ctx.trx!;
        await trxManager.getOrStart('typeorm:default');
        return 'result';
      });

      expect(mockTx.rollback).toHaveBeenCalledTimes(1);
      expect(mockTx.commit).not.toHaveBeenCalled();
    });
  });

  describe('timeout handling', () => {
    it('should throw TransactionTimeoutException on timeout', async () => {
      const ctx = createCtx();
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
      const ctx = createCtx();
      const callback = jest.fn();

      await transaction.run(ctx, async (trx) => {
        trx.onCommit(ctx, callback);
        return 'result';
      });

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should flush onRollback callbacks after error rollback', async () => {
      const ctx = createCtx();
      const callback = jest.fn();

      await expect(
        transaction.run(ctx, async (trx) => {
          trx.onRollback(ctx, callback);
          throw new Error('fail');
        }),
      ).rejects.toThrow('fail');

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should not flush onCommit callbacks on rollback', async () => {
      const ctx = createCtx();
      const commitCb = jest.fn();

      await expect(
        transaction.run(ctx, async (trx) => {
          trx.onCommit(ctx, commitCb);
          throw new Error('fail');
        }),
      ).rejects.toThrow('fail');

      expect(commitCb).not.toHaveBeenCalled();
    });

    it('should not flush onRollback callbacks on commit', async () => {
      const ctx = createCtx();
      const rollbackCb = jest.fn();

      await transaction.run(ctx, async (trx) => {
        trx.onRollback(ctx, rollbackCb);
        return 'result';
      });

      expect(rollbackCb).not.toHaveBeenCalled();
    });

    it('should accumulate callbacks from nested runs and flush at outermost', async () => {
      const ctx = createCtx();
      const order: number[] = [];

      await transaction.run(ctx, async (trx) => {
        trx.onCommit(ctx, () => {
          order.push(1);
        });

        await transaction.run(ctx, async (innerTrx) => {
          innerTrx.onCommit(ctx, () => {
            order.push(2);
          });
          return 'inner';
        });

        trx.onCommit(ctx, () => {
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

      const ctx = createCtx();

      await transaction.run(ctx, async () => {
        const trxManager = ctx.trx!;
        const tx = await trxManager.getOrStart('typeorm:default');
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

      const ctx = createCtx();
      const error = new Error('inner failure');

      await expect(
        transaction.run(ctx, async () => {
          const trxManager = ctx.trx!;
          await trxManager.getOrStart('typeorm:default');

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
