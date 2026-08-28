import { type Mock } from 'vitest';

import { TransactionClosedException } from '../exceptions/transaction-closed.exception.js';

import { type TransactionInterface } from './interfaces/transaction.interface.js';
import { TransactionFactoryRegistry } from './transaction-factory-registry.js';
import { TransactionManager } from './transaction-manager.js';

describe(TransactionManager.name, () => {
  let manager: TransactionManager;
  let registry: TransactionFactoryRegistry;

  const createMockTransaction = (
    overrides: Partial<{
      isActive: boolean;
      isDirty: boolean;
      start: Mock;
      commit: Mock;
      rollback: Mock;
      markDirty: Mock;
      getClient: Mock;
    }> = {},
  ): TransactionInterface => ({
    isActive: false,
    isDirty: false,
    start: vi.fn(),
    commit: vi.fn(),
    rollback: vi.fn(),
    markDirty: vi.fn(),
    getClient: vi.fn(),
    ...overrides,
  });

  const seed = async (
    manager: TransactionManager,
    registry: TransactionFactoryRegistry,
    key: string,
    tx: TransactionInterface,
  ): Promise<void> => {
    registry.register(key, { create: () => tx });
    await manager.getOrStart(key);
  };

  beforeEach(() => {
    registry = new TransactionFactoryRegistry();
    manager = new TransactionManager(registry);
  });

  describe('get', () => {
    it('should return null for unknown key', () => {
      const result = manager.get('unknown:key');
      expect(result).toBeNull();
    });

    it('should return transaction for known key', async () => {
      const mockTx = createMockTransaction();
      await seed(manager, registry, 'typeorm:default', mockTx);

      const result = manager.get('typeorm:default');
      expect(result).toBe(mockTx);
    });
  });

  describe('getOrStart', () => {
    it('should create and start transaction lazily via factory', async () => {
      const newTx = createMockTransaction();
      registry.register('typeorm:default', { create: () => newTx });

      const result = await manager.getOrStart('typeorm:default');

      expect(result).toBe(newTx);
      expect(newTx.start).toHaveBeenCalledTimes(1);
    });

    it('should store lazily created transaction for subsequent gets', async () => {
      const newTx = createMockTransaction();
      registry.register('typeorm:default', { create: () => newTx });

      await manager.getOrStart('typeorm:default');
      const second = await manager.getOrStart('typeorm:default');

      expect(second).toBe(newTx);
      expect(newTx.start).toHaveBeenCalledTimes(1);
    });

    it('should throw when no factory registered for key', async () => {
      await expect(manager.getOrStart('unknown:key')).rejects.toThrow(
        'No transaction factory registered for key "unknown:key"',
      );
    });

    it('should throw TransactionClosedException once the scope is closed', async () => {
      manager.close();

      await expect(manager.getOrStart('typeorm:default')).rejects.toThrow(
        TransactionClosedException,
      );
    });
  });

  describe('lifecycle state', () => {
    it('should default to not read-only, not closed, not failed', () => {
      expect(manager.isReadOnly).toBe(false);
      expect(manager.isClosed).toBe(false);
      expect(manager.hasFailed).toBe(false);
    });

    it('should carry the readOnly flag passed at construction', () => {
      const readOnlyManager = new TransactionManager(registry, true);
      expect(readOnlyManager.isReadOnly).toBe(true);
    });

    it('should track enter/exit depth', () => {
      expect(manager.enter()).toBe(1);
      expect(manager.enter()).toBe(2);
      expect(manager.exit()).toBe(1);
      expect(manager.exit()).toBe(0);
    });

    it('should record markFailed', () => {
      expect(manager.hasFailed).toBe(false);
      manager.markFailed();
      expect(manager.hasFailed).toBe(true);
    });

    it('should record close', () => {
      expect(manager.isClosed).toBe(false);
      manager.close();
      expect(manager.isClosed).toBe(true);
    });
  });

  describe('commitAll', () => {
    it('should commit dirty transactions', async () => {
      const dirtyTx = createMockTransaction({ isActive: true, isDirty: true });
      await seed(manager, registry, 'typeorm:default', dirtyTx);

      await manager.commitAll();

      expect(dirtyTx.commit).toHaveBeenCalledTimes(1);
      expect(dirtyTx.rollback).not.toHaveBeenCalled();
    });

    it('should rollback clean transactions', async () => {
      const cleanTx = createMockTransaction({ isActive: true, isDirty: false });
      await seed(manager, registry, 'typeorm:default', cleanTx);

      await manager.commitAll();

      expect(cleanTx.rollback).toHaveBeenCalledTimes(1);
      expect(cleanTx.commit).not.toHaveBeenCalled();
    });

    it('should skip inactive transactions', async () => {
      const inactiveTx = createMockTransaction({
        isActive: false,
        isDirty: true,
      });
      await seed(manager, registry, 'typeorm:default', inactiveTx);

      await manager.commitAll();

      expect(inactiveTx.commit).not.toHaveBeenCalled();
      expect(inactiveTx.rollback).not.toHaveBeenCalled();
    });

    it('should handle multiple transactions', async () => {
      const dirtyTx = createMockTransaction({ isActive: true, isDirty: true });
      const cleanTx = createMockTransaction({ isActive: true, isDirty: false });
      const inactiveTx = createMockTransaction({
        isActive: false,
        isDirty: true,
      });

      await seed(manager, registry, 'typeorm:default', dirtyTx);
      await seed(manager, registry, 'mongoose:default', cleanTx);
      await seed(manager, registry, 'prisma:default', inactiveTx);

      await manager.commitAll();

      expect(dirtyTx.commit).toHaveBeenCalledTimes(1);
      expect(cleanTx.rollback).toHaveBeenCalledTimes(1);
      expect(inactiveTx.commit).not.toHaveBeenCalled();
      expect(inactiveTx.rollback).not.toHaveBeenCalled();
    });
  });

  describe('rollbackAll', () => {
    it('should rollback active transactions', async () => {
      const activeTx = createMockTransaction({ isActive: true });
      await seed(manager, registry, 'typeorm:default', activeTx);

      await manager.rollbackAll();

      expect(activeTx.rollback).toHaveBeenCalledTimes(1);
    });

    it('should skip inactive transactions', async () => {
      const inactiveTx = createMockTransaction({ isActive: false });
      await seed(manager, registry, 'typeorm:default', inactiveTx);

      await manager.rollbackAll();

      expect(inactiveTx.rollback).not.toHaveBeenCalled();
    });

    it('should handle multiple transactions', async () => {
      const activeTx1 = createMockTransaction({ isActive: true });
      const activeTx2 = createMockTransaction({ isActive: true });
      const inactiveTx = createMockTransaction({ isActive: false });

      await seed(manager, registry, 'typeorm:default', activeTx1);
      await seed(manager, registry, 'mongoose:default', activeTx2);
      await seed(manager, registry, 'prisma:default', inactiveTx);

      await manager.rollbackAll();

      expect(activeTx1.rollback).toHaveBeenCalledTimes(1);
      expect(activeTx2.rollback).toHaveBeenCalledTimes(1);
      expect(inactiveTx.rollback).not.toHaveBeenCalled();
    });
  });

  describe('onCommit / flushOnCommitCallbacks', () => {
    it('should execute callbacks in order on flush', async () => {
      const order: number[] = [];
      manager.onCommit(() => {
        order.push(1);
      });
      manager.onCommit(() => {
        order.push(2);
      });
      manager.onCommit(() => {
        order.push(3);
      });

      await manager.flushOnCommitCallbacks();

      expect(order).toEqual([1, 2, 3]);
    });

    it('should execute async callbacks in order on flush', async () => {
      const order: number[] = [];
      manager.onCommit(async () => {
        order.push(1);
      });
      manager.onCommit(() => {
        order.push(2);
      });
      manager.onCommit(async () => {
        order.push(3);
      });

      await manager.flushOnCommitCallbacks();

      expect(order).toEqual([1, 2, 3]);
    });

    it('should clear callbacks after flush', async () => {
      const fn = vi.fn();
      manager.onCommit(fn);

      await manager.flushOnCommitCallbacks();
      await manager.flushOnCommitCallbacks();

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should not execute callbacks until flushed', () => {
      const fn = vi.fn();
      manager.onCommit(fn);

      expect(fn).not.toHaveBeenCalled();
    });
  });

  describe('onRollback / flushOnRollbackCallbacks', () => {
    it('should execute callbacks in order on flush', async () => {
      const order: number[] = [];
      manager.onRollback(() => {
        order.push(1);
      });
      manager.onRollback(() => {
        order.push(2);
      });
      manager.onRollback(() => {
        order.push(3);
      });

      await manager.flushOnRollbackCallbacks();

      expect(order).toEqual([1, 2, 3]);
    });

    it('should execute async callbacks in order on flush', async () => {
      const order: number[] = [];
      manager.onRollback(async () => {
        order.push(1);
      });
      manager.onRollback(() => {
        order.push(2);
      });
      manager.onRollback(async () => {
        order.push(3);
      });

      await manager.flushOnRollbackCallbacks();

      expect(order).toEqual([1, 2, 3]);
    });

    it('should clear callbacks after flush', async () => {
      const fn = vi.fn();
      manager.onRollback(fn);

      await manager.flushOnRollbackCallbacks();
      await manager.flushOnRollbackCallbacks();

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should not execute callbacks until flushed', () => {
      const fn = vi.fn();
      manager.onRollback(fn);

      expect(fn).not.toHaveBeenCalled();
    });
  });
});
