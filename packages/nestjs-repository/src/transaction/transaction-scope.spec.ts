import { Test, TestingModule } from '@nestjs/testing';

import {
  TransactionInterface,
  TransactionManagerInterface,
  TransactionContextInterface,
} from '@concepta/nestjs-common';

import { TransactionRequiredException } from '../exceptions/transaction-required.exception';
import { TransactionTimeoutException } from '../exceptions/transaction-timeout.exception';
import { REPOSITORY_MODULE_OPTIONS } from '../repository.constants';

import {
  TransactionFactoryRegistry,
  TRANSACTION_FACTORY_REGISTRY,
} from './transaction-factory-registry';
import { TransactionScope } from './transaction-scope';

interface MockTransaction extends TransactionInterface {
  start: jest.Mock;
  commit: jest.Mock;
  rollback: jest.Mock;
  markDirty: jest.Mock;
  getClient: jest.Mock;
}

describe(TransactionScope.name, () => {
  let transactionScope: TransactionScope;
  let mockRegistry: TransactionFactoryRegistry;
  let mockFactory: { create: jest.Mock };
  let mockTransaction: MockTransaction;

  const createMockTransaction = (): MockTransaction => {
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
    mockTransaction = createMockTransaction();

    mockFactory = {
      create: jest.fn().mockReturnValue(mockTransaction),
    };

    mockRegistry = new TransactionFactoryRegistry();
    mockRegistry.register('typeorm:default', mockFactory);

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

    transactionScope = moduleRef.get<TransactionScope>(TransactionScope);
  });

  const createMockTransactionManager = (): TransactionManagerInterface => ({
    get: jest.fn(),
    push: jest.fn(),
    pop: jest.fn(),
    commitAll: jest.fn(),
    rollbackAll: jest.fn(),
  });

  describe('run with REQUIRED propagation', () => {
    it('should create new transaction when no existing', async () => {
      const ctx: TransactionContextInterface = { trx: null };
      const operation = jest.fn().mockResolvedValue('result');

      const result = await transactionScope.run(ctx, operation);

      expect(result).toBe('result');
      expect(mockFactory.create).toHaveBeenCalledTimes(1);
      expect(mockTransaction.start).toHaveBeenCalledTimes(1);
      expect(operation).toHaveBeenCalled();
    });

    it('should join existing transaction', async () => {
      const existingTrx = createMockTransactionManager();
      const ctx: TransactionContextInterface = {
        trx: existingTrx,
      };
      const operation = jest.fn().mockResolvedValue('result');

      const result = await transactionScope.run(ctx, operation);

      expect(result).toBe('result');
      expect(mockFactory.create).not.toHaveBeenCalled();
      expect(operation).toHaveBeenCalled();
    });
  });

  describe('run with REQUIRES_NEW propagation', () => {
    it('should always create new transaction', async () => {
      const existingTrx = createMockTransactionManager();
      const ctx: TransactionContextInterface = {
        trx: existingTrx,
      };
      const operation = jest.fn().mockResolvedValue('result');

      const result = await transactionScope.run(ctx, operation, {
        propagation: 'REQUIRES_NEW',
      });

      expect(result).toBe('result');
      expect(mockFactory.create).toHaveBeenCalledTimes(1);
      expect(mockTransaction.start).toHaveBeenCalledTimes(1);
    });

    it('should suspend existing transaction and restore after', async () => {
      const existingTrx = createMockTransactionManager();
      const ctx: TransactionContextInterface = {
        trx: existingTrx,
      };
      const operation = jest.fn().mockResolvedValue('result');

      await transactionScope.run(ctx, operation, {
        propagation: 'REQUIRES_NEW',
      });

      // After completion, original trx should be restored
      expect(ctx.trx).toBe(existingTrx);
    });
  });

  describe('run with SUPPORTS propagation', () => {
    it('should use existing transaction if available', async () => {
      const existingTrx = createMockTransactionManager();
      const ctx: TransactionContextInterface = {
        trx: existingTrx,
      };
      const operation = jest.fn().mockResolvedValue('result');

      const result = await transactionScope.run(ctx, operation, {
        propagation: 'SUPPORTS',
      });

      expect(result).toBe('result');
      expect(mockFactory.create).not.toHaveBeenCalled();
      expect(operation).toHaveBeenCalled();
    });

    it('should run without transaction if none exists', async () => {
      const ctx: TransactionContextInterface = { trx: null };
      const operation = jest.fn().mockResolvedValue('result');

      const result = await transactionScope.run(ctx, operation, {
        propagation: 'SUPPORTS',
      });

      expect(result).toBe('result');
      expect(mockFactory.create).not.toHaveBeenCalled();
      expect(operation).toHaveBeenCalled();
    });
  });

  describe('run with MANDATORY propagation', () => {
    it('should use existing transaction', async () => {
      const existingTrx = createMockTransactionManager();
      const ctx: TransactionContextInterface = {
        trx: existingTrx,
      };
      const operation = jest.fn().mockResolvedValue('result');

      const result = await transactionScope.run(ctx, operation, {
        propagation: 'MANDATORY',
      });

      expect(result).toBe('result');
      expect(operation).toHaveBeenCalled();
    });

    it('should throw if no existing transaction', async () => {
      const ctx: TransactionContextInterface = { trx: null };
      const operation = jest.fn().mockResolvedValue('result');

      await expect(
        transactionScope.run(ctx, operation, { propagation: 'MANDATORY' }),
      ).rejects.toThrow(TransactionRequiredException);

      expect(operation).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should rollback all on error', async () => {
      const ctx: TransactionContextInterface = { trx: null };
      const error = new Error('Operation failed');
      const operation = jest.fn().mockRejectedValue(error);

      await expect(transactionScope.run(ctx, operation)).rejects.toThrow(error);

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should respect noRollbackFor option', async () => {
      class BusinessError extends Error {}

      // Need to mark transaction as dirty for commit to be attempted
      const dirtyTx = createMockTransaction();
      mockFactory.create.mockReturnValue(dirtyTx);

      const ctx: TransactionContextInterface = { trx: null };
      const error = new BusinessError('Business error');
      const operation = jest.fn().mockImplementation(async () => {
        dirtyTx.markDirty();
        throw error;
      });

      await expect(
        transactionScope.run(ctx, operation, {
          noRollbackFor: [BusinessError],
        }),
      ).rejects.toThrow(error);

      // Should attempt commit instead of rollback
      expect(dirtyTx.commit).toHaveBeenCalled();
    });

    it('should fallback to rollback when commit fails during noRollbackFor', async () => {
      class BusinessError extends Error {}

      const dirtyTx = createMockTransaction();
      // Make commit throw an error
      dirtyTx.commit.mockRejectedValue(new Error('Commit failed'));
      mockFactory.create.mockReturnValue(dirtyTx);

      const ctx: TransactionContextInterface = { trx: null };
      const error = new BusinessError('Business error');
      const operation = jest.fn().mockImplementation(async () => {
        dirtyTx.markDirty();
        throw error;
      });

      await expect(
        transactionScope.run(ctx, operation, {
          noRollbackFor: [BusinessError],
        }),
      ).rejects.toThrow(error);

      // Should attempt commit first, then fallback to rollback
      expect(dirtyTx.commit).toHaveBeenCalled();
      expect(dirtyTx.rollback).toHaveBeenCalled();
    });

    it('should handle rollback failure gracefully', async () => {
      const failingTx = createMockTransaction();
      // Make rollback throw an error
      failingTx.rollback.mockRejectedValue(new Error('Rollback failed'));
      mockFactory.create.mockReturnValue(failingTx);

      const ctx: TransactionContextInterface = { trx: null };
      const operationError = new Error('Operation failed');
      const operation = jest.fn().mockRejectedValue(operationError);

      // Should still throw the original error, not the rollback error
      await expect(transactionScope.run(ctx, operation)).rejects.toThrow(
        operationError,
      );

      expect(failingTx.rollback).toHaveBeenCalled();
    });
  });

  describe('timeout handling', () => {
    it('should handle timeout', async () => {
      const ctx: TransactionContextInterface = { trx: null };
      const operation = jest
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 200)),
        );

      await expect(
        transactionScope.run(ctx, operation, { timeout: 50 }),
      ).rejects.toThrow(TransactionTimeoutException);
    });
  });

  describe('readOnly transactions', () => {
    it('should rollback on success when readOnly=true', async () => {
      const ctx: TransactionContextInterface = { trx: null };
      const operation = jest.fn().mockResolvedValue('result');

      await transactionScope.run(ctx, operation, { readOnly: true });

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockTransaction.commit).not.toHaveBeenCalled();
    });

    it('runReadOnly should set readOnly=true', async () => {
      const ctx: TransactionContextInterface = { trx: null };
      const operation = jest.fn().mockResolvedValue('result');

      await transactionScope.runReadOnly(ctx, operation);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockTransaction.commit).not.toHaveBeenCalled();
    });
  });

  describe('commit behavior', () => {
    it('should commit dirty transactions on success', async () => {
      const dirtyTx = createMockTransaction();
      mockFactory.create.mockReturnValue(dirtyTx);

      const ctx: TransactionContextInterface = { trx: null };
      const operation = jest.fn().mockImplementation(async () => {
        dirtyTx.markDirty();
        return 'result';
      });

      await transactionScope.run(ctx, operation);

      expect(dirtyTx.commit).toHaveBeenCalled();
    });

    it('should rollback clean transactions on success', async () => {
      const ctx: TransactionContextInterface = { trx: null };
      const operation = jest.fn().mockResolvedValue('result');

      await transactionScope.run(ctx, operation);

      // Transaction not marked dirty, should rollback
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });
});
