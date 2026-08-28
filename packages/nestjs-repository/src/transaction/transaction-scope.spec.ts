import { Test, type TestingModule } from '@nestjs/testing';

import { AppContextHost } from '@concepta/nestjs-core';

import { TransactionClosedException } from '../exceptions/transaction-closed.exception.js';
import { TransactionRequiredException } from '../exceptions/transaction-required.exception.js';
import { TransactionTimeoutException } from '../exceptions/transaction-timeout.exception.js';
import { REPOSITORY_MODULE_OPTIONS } from '../repository.constants.js';

import {
  type TransactionContextInterface,
  TrxCtx,
} from './interfaces/transaction-context.interface.js';
import { type TransactionInterface } from './interfaces/transaction.interface.js';
import {
  TransactionFactoryRegistry,
  TRANSACTION_FACTORY_REGISTRY,
} from './transaction-factory-registry.js';
import { TransactionScope } from './transaction-scope.js';

describe(TransactionScope.name, () => {
  let transaction: TransactionScope;
  let mockRegistry: TransactionFactoryRegistry;

  const createMockTransaction = (): TransactionInterface => {
    let isActive = false;

    return {
      get isActive() {
        return isActive;
      },
      start: vi.fn().mockImplementation(async () => {
        isActive = true;
      }),
      commit: vi.fn().mockImplementation(async () => {
        isActive = false;
      }),
      rollback: vi.fn().mockImplementation(async () => {
        isActive = false;
      }),
      getClient: vi.fn(),
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
      const operation = vi.fn().mockResolvedValue('result');

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
      const operation = vi.fn().mockResolvedValue('result');

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

      const operation = vi.fn().mockResolvedValue('result');
      const result = await txScope.run(ctx, operation);

      expect(result).toBe('result');
      expect(operation).toHaveBeenCalled();
    });
  });

  describe('run with MANDATORY propagation', () => {
    it('should run when factories are registered', async () => {
      const ctx = new AppContextHost();
      const operation = vi.fn().mockResolvedValue('result');

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

      const operation = vi.fn().mockResolvedValue('result');

      await expect(
        txScope.run(ctx, operation, { propagation: 'MANDATORY' }),
      ).rejects.toThrow(TransactionRequiredException);

      expect(operation).not.toHaveBeenCalled();
      expect(ctx.supports(TrxCtx)).toBe(false);
    });
  });

  describe('commit and rollback lifecycle', () => {
    it('should commit active transactions on success', async () => {
      const mockTx = createMockTransaction();
      mockRegistry.register('typeorm:default', { create: () => mockTx });

      const ctx = new AppContextHost();

      await transaction.run(ctx, async (txCtx: TransactionContextInterface) => {
        await txCtx.trx.getOrStart('typeorm:default');
        return 'result';
      });

      expect(mockTx.start).toHaveBeenCalledTimes(1);
      expect(mockTx.commit).toHaveBeenCalledTimes(1);
      expect(mockTx.rollback).not.toHaveBeenCalled();
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

    it('should surface the operation error, not a rollback failure that happens while handling it', async () => {
      const mockTx = createMockTransaction();
      mockRegistry.register('typeorm:default', { create: () => mockTx });
      mockTx.rollback = vi
        .fn()
        .mockRejectedValue(new Error('connection dropped during rollback'));

      const ctx = new AppContextHost();
      const operationError = new Error('Operation failed');

      await expect(
        transaction.run(ctx, async (txCtx: TransactionContextInterface) => {
          await txCtx.trx.getOrStart('typeorm:default');
          throw operationError;
        }),
      ).rejects.toBe(operationError);
    });

    it('should surface the commit failure, not a rollback failure that happens while falling back from it', async () => {
      const mockTx = createMockTransaction();
      mockRegistry.register('typeorm:default', { create: () => mockTx });
      const commitError = new Error('commit failed');
      mockTx.commit = vi.fn().mockRejectedValue(commitError);
      mockTx.rollback = vi
        .fn()
        .mockRejectedValue(new Error('connection dropped during rollback'));

      const ctx = new AppContextHost();

      await expect(
        transaction.run(ctx, async (txCtx: TransactionContextInterface) => {
          await txCtx.trx.getOrStart('typeorm:default');
          return 'result';
        }),
      ).rejects.toBe(commitError);
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
          await txCtx.trx.getOrStart('typeorm:default');
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
      const operation = vi
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
      const callback = vi.fn();

      await transaction.run(ctx, async (txCtx: TransactionContextInterface) => {
        txCtx.trx.onCommit(callback);
        return 'result';
      });

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should flush onRollback callbacks after error rollback', async () => {
      const ctx = new AppContextHost();
      const callback = vi.fn();

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
      const commitCb = vi.fn();

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
      const rollbackCb = vi.fn();

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
        await txCtx.trx.getOrStart('typeorm:default');

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

  describe('sequential and concurrent run() on the same context (#468)', () => {
    it('should give each sequential run its own transaction, started and committed once', async () => {
      const created: TransactionInterface[] = [];
      mockRegistry.register('typeorm:default', {
        create: () => {
          const tx = createMockTransaction();
          created.push(tx);
          return tx;
        },
      });

      const ctx = new AppContextHost();

      await transaction.run(ctx, async (txCtx: TransactionContextInterface) => {
        await txCtx.trx.getOrStart('typeorm:default');
      });

      await transaction.run(ctx, async (txCtx: TransactionContextInterface) => {
        await txCtx.trx.getOrStart('typeorm:default');
      });

      expect(created).toHaveLength(2);
      expect(created[0]).not.toBe(created[1]);
      expect(created[0].commit).toHaveBeenCalledTimes(1);
      expect(created[1].commit).toHaveBeenCalledTimes(1);
    });

    it('should clear supports(TrxCtx) after a successful run and after a throwing run', async () => {
      const ctx = new AppContextHost();

      await transaction.run(ctx, async () => 'ok');
      expect(ctx.supports(TrxCtx)).toBe(false);

      await expect(
        transaction.run(ctx, async () => {
          throw new Error('fail');
        }),
      ).rejects.toThrow('fail');
      expect(ctx.supports(TrxCtx)).toBe(false);
    });

    it('should not clear supports(TrxCtx) for a nested run — only the outermost settles it', async () => {
      const ctx = new AppContextHost();

      await transaction.run(ctx, async () => {
        await transaction.run(ctx, async () => 'inner');

        // Still inside the outer operation — the scope must still be live.
        expect(ctx.supports(TrxCtx)).toBe(true);

        return 'outer';
      });

      expect(ctx.supports(TrxCtx)).toBe(false);
    });

    it('should share one transaction across concurrent runs and commit once, after both resolve', async () => {
      const mockTx = createMockTransaction();
      mockRegistry.register('typeorm:default', { create: () => mockTx });

      const ctx = new AppContextHost();

      const slow = transaction.run(
        ctx,
        async (txCtx: TransactionContextInterface) => {
          await txCtx.trx.getOrStart('typeorm:default');
          await new Promise((resolve) => setTimeout(resolve, 20));
          return 'slow';
        },
      );

      const fast = transaction.run(
        ctx,
        async (txCtx: TransactionContextInterface) => {
          await txCtx.trx.getOrStart('typeorm:default');
          // The slow run is still in flight — nobody should have settled yet.
          expect(mockTx.commit).not.toHaveBeenCalled();
          return 'fast';
        },
      );

      const [slowResult, fastResult] = await Promise.all([slow, fast]);

      expect(slowResult).toBe('slow');
      expect(fastResult).toBe('fast');
      expect(mockTx.commit).toHaveBeenCalledTimes(1);
      expect(ctx.supports(TrxCtx)).toBe(false);
    });

    it('should have removed TrxCtx from ctx by the time onCommit callbacks run', async () => {
      const ctx = new AppContextHost();
      let sawDuringCallback: boolean | undefined;

      await transaction.run(ctx, async (txCtx: TransactionContextInterface) => {
        txCtx.trx.onCommit(() => {
          sawDuringCallback = ctx.supports(TrxCtx);
        });
      });

      expect(sawDuringCallback).toBe(false);
    });

    it('should keep the run-scoped child resolving TrxCtx after the scope closes, and fail loudly on reuse', async () => {
      const mockTx = createMockTransaction();
      mockRegistry.register('typeorm:default', { create: () => mockTx });

      const ctx = new AppContextHost();
      let capturedTxCtx: TransactionContextInterface | undefined;

      await transaction.run(ctx, async (txCtx: TransactionContextInterface) => {
        capturedTxCtx = txCtx;
      });

      expect(capturedTxCtx).toBeDefined();
      const childHost = AppContextHost.from(
        capturedTxCtx as TransactionContextInterface,
      );

      // The parent ctx released the scope...
      expect(ctx.supports(TrxCtx)).toBe(false);
      // ...but a handle still held by orphaned code keeps resolving it,
      // rather than silently falling through to non-transactional access.
      expect(childHost.supports(TrxCtx)).toBe(true);

      await expect(
        (capturedTxCtx as TransactionContextInterface).trx.getOrStart(
          'typeorm:default',
        ),
      ).rejects.toThrow(TransactionClosedException);
    });
  });
});
