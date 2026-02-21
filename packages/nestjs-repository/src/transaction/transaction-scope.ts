import {
  Injectable,
  Inject,
  Optional,
  PlainLiteralObject,
} from '@nestjs/common';

import {
  AppContextHost,
  TransactionContextInterface,
} from '@concepta/nestjs-common';

import { TransactionRequiredException } from '../exceptions/transaction-required.exception';
import { TransactionTimeoutException } from '../exceptions/transaction-timeout.exception';
import { RepositoryModuleOptionsInterface } from '../interfaces/repository-module-options.interface';
import { PropagationBehavior } from '../interfaces/transactional-options.interface';
import { REPOSITORY_MODULE_OPTIONS } from '../repository.constants';

import {
  TransactionFactoryRegistry,
  TRANSACTION_FACTORY_REGISTRY,
} from './transaction-factory-registry';
import { TransactionManager } from './transaction-manager';

const DEFAULT_TIMEOUT = 30000;

export interface TransactionRunOptions {
  propagation?: PropagationBehavior;
  readOnly?: boolean;
  timeout?: number;
}

/**
 * Orchestrates transaction lifecycle.
 *
 * Every unit of work calls `run()`. The first (outermost) call creates the
 * `TransactionManager` and registers it on the context. Nested `run()` calls
 * see the existing manager and simply execute the operation (join).
 *
 * Only the outermost `run()` commits/rolls back and flushes callbacks.
 *
 * @example
 * ```typescript
 * async execute(command: CreateCacheCommand): Promise<CacheInterface> {
 *   const { context, dto } = command;
 *   return this.txScope.run(context, async (trx) => {
 *     const cache = Cache.create(dto, this.settings);
 *     await cacheRepo.save({ dto: cache.toPlain(), ctx: context });
 *     trx.onCommit(context, () => cache.commit());
 *     return cache.toPlain();
 *   });
 * }
 * ```
 */
@Injectable()
export class TransactionScope {
  private readonly defaultTimeout: number;

  constructor(
    @Inject(TRANSACTION_FACTORY_REGISTRY)
    private readonly registry: TransactionFactoryRegistry,
    @Optional()
    @Inject(REPOSITORY_MODULE_OPTIONS)
    options?: RepositoryModuleOptionsInterface,
  ) {
    this.defaultTimeout = options?.defaultTimeout ?? DEFAULT_TIMEOUT;
  }

  /**
   * Execute an operation within a transaction scope.
   *
   * Uses `merge()` to ensure a context exists and set up the transaction
   * manager if one doesn't already exist. Nested calls join the existing
   * transaction. Only the outermost call owns the lifecycle.
   */
  async run<T>(
    ctx: PlainLiteralObject,
    operation: (trx: TransactionScope) => Promise<T>,
    options?: TransactionRunOptions,
  ): Promise<T> {
    const propagation = options?.propagation ?? 'REQUIRED';
    const readOnly = options?.readOnly ?? false;
    const timeout = options?.timeout ?? this.defaultTimeout;

    let manager: TransactionManager | undefined;

    const context = AppContextHost.merge<TransactionContextInterface>((has) => {
      // MANDATORY: require existing transaction
      if (propagation === 'MANDATORY' && !has('trx')) {
        throw new TransactionRequiredException();
      }

      // SUPPORTS without existing transaction: skip creating manager
      if (propagation === 'SUPPORTS' && !has('trx')) {
        return {};
      }

      // No existing transaction — I'm the outermost, create manager
      if (!has('trx')) {
        manager = new TransactionManager(this.registry);
        return { trx: manager };
      }

      return {};
    }, ctx);

    // SUPPORTS without transaction: run without transaction
    if (propagation === 'SUPPORTS' && !context.has('trx')) {
      return operation(this);
    }

    // Join existing or just run (manager is only set for outermost)
    if (!manager) {
      return operation(this);
    }

    // I'm the outermost — own the lifecycle
    try {
      const result = await this.withTimeout(operation(this), timeout);

      if (readOnly) {
        await manager.rollbackAll();
      } else {
        await manager.commitAll();
        manager.flushOnCommitCallbacks();
      }

      return result;
    } catch (error) {
      await manager.rollbackAll();
      manager.flushOnRollbackCallbacks();
      throw error;
    }
  }

  /**
   * Execute an operation in a read-only transaction scope.
   * Shorthand for `run(ctx, operation, { readOnly: true })`.
   */
  async runReadOnly<T>(
    ctx: PlainLiteralObject,
    operation: (trx: TransactionScope) => Promise<T>,
  ): Promise<T> {
    return this.run(ctx, operation, { readOnly: true });
  }

  /**
   * Register a callback to run after the transaction commits.
   */
  onCommit(ctx: TransactionContextInterface, fn: () => void): void {
    ctx.trx.onCommit(fn);
  }

  /**
   * Register a callback to run after the transaction rolls back.
   */
  onRollback(ctx: TransactionContextInterface, fn: () => void): void {
    ctx.trx.onRollback(fn);
  }

  private withTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const handle = setTimeout(() => {
        reject(new TransactionTimeoutException(timeout));
      }, timeout);

      promise.then(
        (result) => {
          clearTimeout(handle);
          resolve(result);
        },
        (error) => {
          clearTimeout(handle);
          reject(error);
        },
      );
    });
  }
}
