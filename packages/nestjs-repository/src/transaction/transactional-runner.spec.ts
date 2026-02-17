import { of, throwError } from 'rxjs';

import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';

import { TransactionInterface } from '@concepta/nestjs-common';

import { TransactionFactoryInterface } from '../interfaces/transaction-factory.interface';
import { REPOSITORY_MODULE_OPTIONS } from '../repository.constants';

import {
  TransactionFactoryRegistry,
  TRANSACTION_FACTORY_REGISTRY,
} from './transaction-factory-registry';
import { TransactionScope } from './transaction-scope';
import { TransactionalRunner } from './transactional-runner';
import { Transactional } from './transactional.decorator';

describe(TransactionalRunner.name, () => {
  let runner: TransactionalRunner;
  let _transactionScope: TransactionScope;
  let mockRegistry: TransactionFactoryRegistry;
  let mockFactory: jest.Mocked<TransactionFactoryInterface>;
  let mockTransaction: jest.Mocked<TransactionInterface>;

  const createMockTransaction = (): jest.Mocked<TransactionInterface> => {
    let isActive = false;

    return {
      get isActive() {
        return isActive;
      },
      isDirty: false,
      start: jest.fn().mockImplementation(async () => {
        isActive = true;
      }),
      commit: jest.fn().mockImplementation(async () => {
        isActive = false;
      }),
      rollback: jest.fn().mockImplementation(async () => {
        isActive = false;
      }),
      markDirty: jest.fn(),
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
        TransactionalRunner,
        TransactionScope,
        Reflector,
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

    runner = moduleRef.get<TransactionalRunner>(TransactionalRunner);
    _transactionScope = moduleRef.get<TransactionScope>(TransactionScope);
  });

  describe('run', () => {
    it('should call operation without transaction when no @Transactional', (done) => {
      function handlerWithoutDecorator() {
        return 'result';
      }

      const operation = jest.fn().mockReturnValue(of('result'));

      runner.run(handlerWithoutDecorator, operation).subscribe({
        next: (result) => {
          expect(result).toBe('result');
          expect(operation).toHaveBeenCalledWith(null);
          expect(mockFactory.create).not.toHaveBeenCalled();
        },
        complete: done,
      });
    });

    it('should wrap operation in transaction when @Transactional present', (done) => {
      class TestHandler {
        @Transactional()
        handle() {
          return 'result';
        }
      }

      const handler = new TestHandler();
      const operation = jest.fn().mockReturnValue(of('result'));

      runner.run(handler.handle, operation).subscribe({
        next: (result) => {
          expect(result).toBe('result');
          expect(mockFactory.create).toHaveBeenCalled();
          expect(mockTransaction.start).toHaveBeenCalled();
        },
        complete: done,
      });
    });

    it('should pass transaction manager to operation', (done) => {
      class TestHandler {
        @Transactional()
        handle() {
          return 'result';
        }
      }

      const handler = new TestHandler();
      let receivedTrx: unknown = 'not-set';

      const operation = jest.fn().mockImplementation((trx) => {
        receivedTrx = trx;
        return of('result');
      });

      runner.run(handler.handle, operation).subscribe({
        next: () => {
          expect(receivedTrx).not.toBeNull();
          expect(receivedTrx).not.toBe('not-set');
        },
        complete: done,
      });
    });

    it('should handle errors from operation', (done) => {
      class TestHandler {
        @Transactional()
        handle() {
          return 'result';
        }
      }

      const handler = new TestHandler();
      const error = new Error('Operation failed');
      const operation = jest.fn().mockReturnValue(throwError(() => error));

      runner.run(handler.handle, operation).subscribe({
        error: (err) => {
          expect(err).toBe(error);
          expect(mockTransaction.rollback).toHaveBeenCalled();
          done();
        },
      });
    });

    it('should use propagation options from decorator', (done) => {
      class TestHandler {
        @Transactional({ propagation: 'REQUIRES_NEW' })
        handle() {
          return 'result';
        }
      }

      const handler = new TestHandler();
      const operation = jest.fn().mockReturnValue(of('result'));

      // Even with existing context, REQUIRES_NEW should create new transaction
      runner.run(handler.handle, operation).subscribe({
        next: () => {
          expect(mockFactory.create).toHaveBeenCalled();
        },
        complete: done,
      });
    });

    it('should use readOnly option from decorator', (done) => {
      class TestHandler {
        @Transactional({ readOnly: true })
        handle() {
          return 'result';
        }
      }

      const handler = new TestHandler();
      const operation = jest.fn().mockReturnValue(of('result'));

      runner.run(handler.handle, operation).subscribe({
        next: () => {
          expect(mockTransaction.rollback).toHaveBeenCalled();
          expect(mockTransaction.commit).not.toHaveBeenCalled();
        },
        complete: done,
      });
    });
  });
});
