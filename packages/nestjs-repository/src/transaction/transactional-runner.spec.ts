import { of, throwError } from 'rxjs';

import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';

import {
  AppContextHost,
  TransactionContextInterface,
  TransactionInterface,
} from '@concepta/nestjs-common';

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
  let mockRegistry: TransactionFactoryRegistry;
  let mockFactory: jest.Mocked<TransactionFactoryInterface>;
  let mockTransaction: TransactionInterface;

  const createMockTransaction = (): TransactionInterface => {
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

  const createCtx = () => new AppContextHost<TransactionContextInterface>();

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
  });

  describe('run', () => {
    it('should call operation without transaction when no @Transactional', (done) => {
      class PlainController {}

      function handlerWithoutDecorator() {
        return 'result';
      }

      const ctx = createCtx();
      const operation = jest.fn().mockReturnValue(of('result'));

      runner
        .run(handlerWithoutDecorator, PlainController, ctx, operation)
        .subscribe({
          next: (result) => {
            expect(result).toBe('result');
            expect(ctx.has('trx')).toBe(false);
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
      const ctx = createCtx();
      const operation = jest.fn().mockReturnValue(of('result'));

      runner.run(handler.handle, TestHandler, ctx, operation).subscribe({
        next: (result) => {
          expect(result).toBe('result');
          expect(ctx.has('trx')).toBe(true);
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
      const ctx = createCtx();
      const error = new Error('Operation failed');
      const operation = jest.fn().mockReturnValue(throwError(() => error));

      runner.run(handler.handle, TestHandler, ctx, operation).subscribe({
        error: (err) => {
          expect(err).toBe(error);
          done();
        },
      });
    });

    it('should use class-level @Transactional for methods without decorator', (done) => {
      @Transactional()
      class TransactionalController {
        handle() {
          return 'result';
        }
      }

      const ctrl = new TransactionalController();
      const ctx = createCtx();
      const operation = jest.fn().mockReturnValue(of('result'));

      runner
        .run(ctrl.handle, TransactionalController, ctx, operation)
        .subscribe({
          next: (result) => {
            expect(result).toBe('result');
            expect(ctx.has('trx')).toBe(true);
          },
          complete: done,
        });
    });

    it('should respect @Transactional(false) override on method when class has @Transactional', (done) => {
      @Transactional()
      class TransactionalController {
        @Transactional(false)
        handle() {
          return 'result';
        }
      }

      const ctrl = new TransactionalController();
      const ctx = createCtx();
      const operation = jest.fn().mockReturnValue(of('result'));

      runner
        .run(ctrl.handle, TransactionalController, ctx, operation)
        .subscribe({
          next: (result) => {
            expect(result).toBe('result');
            expect(ctx.has('trx')).toBe(false);
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
      const ctx = createCtx();
      const operation = jest.fn().mockReturnValue(of('result'));

      runner.run(handler.handle, TestHandler, ctx, operation).subscribe({
        next: () => {
          expect(ctx.has('trx')).toBe(true);
        },
        complete: done,
      });
    });
  });
});
