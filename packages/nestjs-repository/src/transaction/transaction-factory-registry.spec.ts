import { type TransactionFactoryInterface } from '../interfaces/transaction-factory.interface.js';

import { type TransactionInterface } from './interfaces/transaction.interface.js';
import { TransactionFactoryRegistry } from './transaction-factory-registry.js';

describe(TransactionFactoryRegistry.name, () => {
  let registry: TransactionFactoryRegistry;
  let mockFactory: TransactionFactoryInterface;
  let mockTransaction: TransactionInterface;

  beforeEach(() => {
    registry = new TransactionFactoryRegistry();

    mockTransaction = {
      isActive: false,
      start: vi.fn(),
      commit: vi.fn(),
      rollback: vi.fn(),
      getClient: vi.fn(),
    };

    mockFactory = {
      create: vi.fn().mockReturnValue(mockTransaction),
    };
  });

  describe('register', () => {
    it('should register a factory', () => {
      registry.register('typeorm:default', mockFactory);
      expect(registry.has('typeorm:default')).toBe(true);
    });

    it('should skip if key already exists', () => {
      const secondFactory: TransactionFactoryInterface = {
        create: vi.fn(),
      };

      registry.register('typeorm:default', mockFactory);
      registry.register('typeorm:default', secondFactory);

      // Should still have the first factory
      const retrieved = registry.get('typeorm:default');
      expect(retrieved).toBe(mockFactory);
    });
  });

  describe('get', () => {
    it('should return factory for key', () => {
      registry.register('typeorm:default', mockFactory);
      const retrieved = registry.get('typeorm:default');
      expect(retrieved).toBe(mockFactory);
    });

    it('should return undefined for unknown key', () => {
      const retrieved = registry.get('unknown:key');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('getAll', () => {
    it('should return copy of all factories', () => {
      const secondFactory: TransactionFactoryInterface = {
        create: vi.fn(),
      };

      registry.register('typeorm:default', mockFactory);
      registry.register('mongoose:default', secondFactory);

      const all = registry.getAll();

      expect(all.size).toBe(2);
      expect(all.get('typeorm:default')).toBe(mockFactory);
      expect(all.get('mongoose:default')).toBe(secondFactory);
    });

    it('should return a copy not the original', () => {
      registry.register('typeorm:default', mockFactory);

      const all = registry.getAll();
      all.delete('typeorm:default');

      // Original should still have the factory
      expect(registry.has('typeorm:default')).toBe(true);
    });
  });

  describe('has', () => {
    it('should return true for registered key', () => {
      registry.register('typeorm:default', mockFactory);
      expect(registry.has('typeorm:default')).toBe(true);
    });

    it('should return false for unknown key', () => {
      expect(registry.has('unknown:key')).toBe(false);
    });
  });
});
