import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';

import { TypeOrmTransaction } from './typeorm-transaction';
import { TypeOrmTransactionFactory } from './typeorm-transaction.factory';

interface MockQueryRunner {
  connect: jest.Mock;
  startTransaction: jest.Mock;
  commitTransaction: jest.Mock;
  rollbackTransaction: jest.Mock;
  release: jest.Mock;
  isTransactionActive: boolean;
  manager: EntityManager | undefined;
}

describe(TypeOrmTransaction.name, () => {
  let transaction: TypeOrmTransaction;
  let mockDataSource: DeepMockProxy<DataSource>;
  let mockQueryRunner: MockQueryRunner;
  let mockEntityManager: DeepMockProxy<EntityManager>;

  beforeEach(() => {
    mockEntityManager = mockDeep<EntityManager>();

    mockQueryRunner = {
      connect: jest.fn().mockResolvedValue(undefined),
      startTransaction: jest.fn().mockResolvedValue(undefined),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      rollbackTransaction: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
      isTransactionActive: false,
      manager: mockEntityManager,
    };

    mockDataSource = mockDeep<DataSource>();
    mockDataSource.createQueryRunner.mockReturnValue(
      mockQueryRunner as unknown as QueryRunner,
    );

    transaction = new TypeOrmTransaction(mockDataSource);
  });

  describe('isActive', () => {
    it('should return false when no query runner', () => {
      expect(transaction.isActive).toBe(false);
    });

    it('should return query runner transaction active state', async () => {
      await transaction.start();
      mockQueryRunner.isTransactionActive = true;
      expect(transaction.isActive).toBe(true);
    });
  });

  describe('isDirty', () => {
    it('should return false initially', () => {
      expect(transaction.isDirty).toBe(false);
    });

    it('should return true after markDirty', () => {
      transaction.markDirty();
      expect(transaction.isDirty).toBe(true);
    });
  });

  describe('start', () => {
    it('should create query runner, connect, and start transaction', async () => {
      await transaction.start();

      expect(mockDataSource.createQueryRunner).toHaveBeenCalled();
      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
    });
  });

  describe('markDirty', () => {
    it('should set isDirty to true', () => {
      expect(transaction.isDirty).toBe(false);
      transaction.markDirty();
      expect(transaction.isDirty).toBe(true);
    });
  });

  describe('commit', () => {
    it('should throw if no active transaction', async () => {
      await expect(transaction.commit()).rejects.toThrow(
        'No active transaction to commit',
      );
    });

    it('should commit transaction and release query runner', async () => {
      await transaction.start();
      await transaction.commit();

      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should reset isDirty after commit', async () => {
      await transaction.start();
      transaction.markDirty();
      expect(transaction.isDirty).toBe(true);

      await transaction.commit();
      expect(transaction.isDirty).toBe(false);
    });

    it('should release query runner even if commit fails', async () => {
      await transaction.start();
      mockQueryRunner.commitTransaction.mockRejectedValueOnce(
        new Error('Commit failed'),
      );

      await expect(transaction.commit()).rejects.toThrow('Commit failed');
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe('rollback', () => {
    it('should do nothing if no query runner', async () => {
      await transaction.rollback();
      expect(mockQueryRunner.rollbackTransaction).not.toHaveBeenCalled();
    });

    it('should rollback and release when transaction is active', async () => {
      await transaction.start();
      mockQueryRunner.isTransactionActive = true;

      await transaction.rollback();

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should only release when transaction is not active', async () => {
      await transaction.start();
      mockQueryRunner.isTransactionActive = false;

      await transaction.rollback();

      expect(mockQueryRunner.rollbackTransaction).not.toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should reset isDirty after rollback', async () => {
      await transaction.start();
      transaction.markDirty();
      mockQueryRunner.isTransactionActive = true;

      await transaction.rollback();
      expect(transaction.isDirty).toBe(false);
    });

    it('should release query runner even if rollback fails', async () => {
      await transaction.start();
      mockQueryRunner.isTransactionActive = true;
      mockQueryRunner.rollbackTransaction.mockRejectedValueOnce(
        new Error('Rollback failed'),
      );

      await expect(transaction.rollback()).rejects.toThrow('Rollback failed');
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe('getClient', () => {
    it('should throw if no active transaction', () => {
      expect(() => transaction.getClient()).toThrow(
        'No active transaction - cannot get client',
      );
    });

    it('should return entity manager when transaction is active', async () => {
      await transaction.start();

      const client = transaction.getClient<EntityManager>();
      expect(client).toBe(mockEntityManager);
    });

    it('should throw if query runner has no manager', async () => {
      await transaction.start();
      (mockQueryRunner as { manager: EntityManager | undefined }).manager =
        undefined;

      expect(() => transaction.getClient()).toThrow(
        'No active transaction - cannot get client',
      );
    });
  });
});

describe(TypeOrmTransactionFactory.name, () => {
  let factory: TypeOrmTransactionFactory;
  let mockDataSource: DeepMockProxy<DataSource>;

  beforeEach(() => {
    mockDataSource = mockDeep<DataSource>();
    factory = new TypeOrmTransactionFactory(mockDataSource);
  });

  describe('create', () => {
    it('should create a TypeOrmTransaction instance', () => {
      const transaction = factory.create();
      expect(transaction).toBeInstanceOf(TypeOrmTransaction);
    });

    it('should create new transaction on each call', () => {
      const tx1 = factory.create();
      const tx2 = factory.create();
      expect(tx1).not.toBe(tx2);
    });
  });
});
