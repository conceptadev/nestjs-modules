import { TransactionInterface } from './interfaces/transaction.interface';
import { TransactionFactoryRegistry } from './transaction-factory-registry';
import { TransactionManager } from './transaction-manager';

describe(TransactionManager.name, () => {
  let manager: TransactionManager;
  let registry: TransactionFactoryRegistry;

  const createMockTransaction = (
    overrides: Partial<{
      isActive: boolean;
      isDirty: boolean;
      start: jest.Mock;
      commit: jest.Mock;
      rollback: jest.Mock;
      markDirty: jest.Mock;
      getClient: jest.Mock;
    }> = {},
  ): TransactionInterface => ({
    isActive: false,
    isDirty: false,
    start: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn(),
    markDirty: jest.fn(),
    getClient: jest.fn(),
    ...overrides,
  });

  beforeEach(() => {
    registry = new TransactionFactoryRegistry();
    manager = new TransactionManager(registry);
  });

  describe('get', () => {
    it('should return null for unknown key', () => {
      const result = manager.get('unknown:key');
      expect(result).toBeNull();
    });

    it('should return transaction for known key', () => {
      const mockTx = createMockTransaction();
      manager.push('typeorm:default', mockTx);

      const result = manager.get('typeorm:default');
      expect(result).toBe(mockTx);
    });
  });

  describe('getOrStart', () => {
    it('should return existing transaction without creating new one', async () => {
      const existingTx = createMockTransaction();
      manager.push('typeorm:default', existingTx);

      const result = await manager.getOrStart('typeorm:default');

      expect(result).toBe(existingTx);
      expect(existingTx.start).not.toHaveBeenCalled();
    });

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
  });

  describe('push', () => {
    it('should store transaction', () => {
      const mockTx = createMockTransaction();
      manager.push('typeorm:default', mockTx);

      expect(manager.get('typeorm:default')).toBe(mockTx);
    });

    it('should stack transactions for same key', () => {
      const firstTx = createMockTransaction();
      const secondTx = createMockTransaction();

      manager.push('typeorm:default', firstTx);
      manager.push('typeorm:default', secondTx);

      // Current should be second
      expect(manager.get('typeorm:default')).toBe(secondTx);
    });
  });

  describe('pop', () => {
    it('should restore previous transaction', () => {
      const firstTx = createMockTransaction();
      const secondTx = createMockTransaction();

      manager.push('typeorm:default', firstTx);
      manager.push('typeorm:default', secondTx);

      manager.pop('typeorm:default');

      expect(manager.get('typeorm:default')).toBe(firstTx);
    });

    it('should remove transaction when no previous exists', () => {
      const mockTx = createMockTransaction();
      manager.push('typeorm:default', mockTx);

      manager.pop('typeorm:default');

      expect(manager.get('typeorm:default')).toBeNull();
    });

    it('should handle multiple levels of nesting', () => {
      const tx1 = createMockTransaction();
      const tx2 = createMockTransaction();
      const tx3 = createMockTransaction();

      manager.push('typeorm:default', tx1);
      manager.push('typeorm:default', tx2);
      manager.push('typeorm:default', tx3);

      expect(manager.get('typeorm:default')).toBe(tx3);

      manager.pop('typeorm:default');
      expect(manager.get('typeorm:default')).toBe(tx2);

      manager.pop('typeorm:default');
      expect(manager.get('typeorm:default')).toBe(tx1);

      manager.pop('typeorm:default');
      expect(manager.get('typeorm:default')).toBeNull();
    });

    it('should handle pop on empty key gracefully', () => {
      expect(() => manager.pop('unknown:key')).not.toThrow();
      expect(manager.get('unknown:key')).toBeNull();
    });
  });

  describe('commitAll', () => {
    it('should commit dirty transactions', async () => {
      const dirtyTx = createMockTransaction({ isActive: true, isDirty: true });
      manager.push('typeorm:default', dirtyTx);

      await manager.commitAll();

      expect(dirtyTx.commit).toHaveBeenCalledTimes(1);
      expect(dirtyTx.rollback).not.toHaveBeenCalled();
    });

    it('should rollback clean transactions', async () => {
      const cleanTx = createMockTransaction({ isActive: true, isDirty: false });
      manager.push('typeorm:default', cleanTx);

      await manager.commitAll();

      expect(cleanTx.rollback).toHaveBeenCalledTimes(1);
      expect(cleanTx.commit).not.toHaveBeenCalled();
    });

    it('should skip inactive transactions', async () => {
      const inactiveTx = createMockTransaction({
        isActive: false,
        isDirty: true,
      });
      manager.push('typeorm:default', inactiveTx);

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

      manager.push('typeorm:default', dirtyTx);
      manager.push('mongoose:default', cleanTx);
      manager.push('prisma:default', inactiveTx);

      await manager.commitAll();

      expect(dirtyTx.commit).toHaveBeenCalledTimes(1);
      expect(cleanTx.rollback).toHaveBeenCalledTimes(1);
      expect(inactiveTx.commit).not.toHaveBeenCalled();
      expect(inactiveTx.rollback).not.toHaveBeenCalled();
    });

    it('should only affect current (top) transactions', async () => {
      const outerTx = createMockTransaction({ isActive: true, isDirty: true });
      const innerTx = createMockTransaction({ isActive: true, isDirty: true });

      manager.push('typeorm:default', outerTx);
      manager.push('typeorm:default', innerTx);

      await manager.commitAll();

      // Only inner (current) should be committed
      expect(innerTx.commit).toHaveBeenCalledTimes(1);
      expect(outerTx.commit).not.toHaveBeenCalled();
    });
  });

  describe('rollbackAll', () => {
    it('should rollback active transactions', async () => {
      const activeTx = createMockTransaction({ isActive: true });
      manager.push('typeorm:default', activeTx);

      await manager.rollbackAll();

      expect(activeTx.rollback).toHaveBeenCalledTimes(1);
    });

    it('should skip inactive transactions', async () => {
      const inactiveTx = createMockTransaction({ isActive: false });
      manager.push('typeorm:default', inactiveTx);

      await manager.rollbackAll();

      expect(inactiveTx.rollback).not.toHaveBeenCalled();
    });

    it('should handle multiple transactions', async () => {
      const activeTx1 = createMockTransaction({ isActive: true });
      const activeTx2 = createMockTransaction({ isActive: true });
      const inactiveTx = createMockTransaction({ isActive: false });

      manager.push('typeorm:default', activeTx1);
      manager.push('mongoose:default', activeTx2);
      manager.push('prisma:default', inactiveTx);

      await manager.rollbackAll();

      expect(activeTx1.rollback).toHaveBeenCalledTimes(1);
      expect(activeTx2.rollback).toHaveBeenCalledTimes(1);
      expect(inactiveTx.rollback).not.toHaveBeenCalled();
    });

    it('should only affect current (top) transactions', async () => {
      const outerTx = createMockTransaction({ isActive: true });
      const innerTx = createMockTransaction({ isActive: true });

      manager.push('typeorm:default', outerTx);
      manager.push('typeorm:default', innerTx);

      await manager.rollbackAll();

      // Only inner (current) should be rolled back
      expect(innerTx.rollback).toHaveBeenCalledTimes(1);
      expect(outerTx.rollback).not.toHaveBeenCalled();
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
      const fn = jest.fn();
      manager.onCommit(fn);

      await manager.flushOnCommitCallbacks();
      await manager.flushOnCommitCallbacks();

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should not execute callbacks until flushed', () => {
      const fn = jest.fn();
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
      const fn = jest.fn();
      manager.onRollback(fn);

      await manager.flushOnRollbackCallbacks();
      await manager.flushOnRollbackCallbacks();

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should not execute callbacks until flushed', () => {
      const fn = jest.fn();
      manager.onRollback(fn);

      expect(fn).not.toHaveBeenCalled();
    });
  });
});
