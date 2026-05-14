import {
  Injectable,
  Inject,
  Optional,
  PlainLiteralObject,
} from '@nestjs/common';

import { AppContextHost } from '@concepta/rockets-app';

import { TransactionRequiredException } from '../exceptions/transaction-required.exception';
import { TransactionTimeoutException } from '../exceptions/transaction-timeout.exception';
import { RepositoryModuleOptionsInterface } from '../interfaces/repository-module-options.interface';
import { PropagationBehavior } from '../interfaces/transactional-options.interface';
import { REPOSITORY_MODULE_OPTIONS } from '../repository.constants';

import {
  TransactionContextInterface,
  TrxCtx,
} from './interfaces/transaction-context.interface';
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
 * Every unit of work calls `run()`. The first (outermost) call defines
 * `TrxCtx` on the context and owns the lifecycle — it commits/rolls
 * back and flushes callbacks. Nested `run()` calls detect `TrxCtx`
 * is already defined and simply join.
 *
 * @example
 * ```typescript
 * async execute(command: CreateCacheCommand): Promise<Cache> {
 *   return this.txScope.run(command.ctx, async (txCtx) => {
 *     const cache = Cache.create(eventContext, dto, expirationDate);
 *     await cacheRepo.save(txCtx, cache);
 *     txCtx.trx.onCommit(() => cache.commit());
 *     return cache;
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
   * Defines `TrxCtx` on the context if not already present, then
   * runs the full lifecycle ceremony. Nesting is detected via
   * `ctx.supports(TrxCtx)`.
   */
  async run<T>(
    ctx: PlainLiteralObject,
    operation: (txCtx: TransactionContextInterface) => Promise<T>,
    options?: TransactionRunOptions,
  ): Promise<T> {
    const appCtx = AppContextHost.from(ctx);
    const propagation = options?.propagation ?? 'SUPPORTS';
    const readOnly = options?.readOnly ?? false;
    const timeout = options?.timeout ?? this.defaultTimeout;

    const isNested = appCtx.supports(TrxCtx);

    if (!isNested) {
      appCtx.defineOverlay(TrxCtx, {
        trx: new TransactionManager(this.registry),
      });
    }

    const txCtx = appCtx.with(TrxCtx);
    const { trx } = txCtx;

    // MANDATORY: require real transaction support
    if (propagation === 'MANDATORY' && !trx.isSupported) {
      throw new TransactionRequiredException();
    }

    // Nested call — just run, outermost owns lifecycle
    if (isNested) {
      return operation(txCtx);
    }

    // Outermost — own lifecycle
    try {
      const result = await this.withTimeout(operation(txCtx), timeout);

      if (readOnly) {
        await trx.rollbackAll();
      } else {
        await trx.commitAll();
        await trx.flushOnCommitCallbacks();
      }

      return result;
    } catch (error) {
      await trx.rollbackAll();
      await trx.flushOnRollbackCallbacks();
      throw error;
    }
  }

  /**
   * Execute an operation in a read-only transaction scope.
   * Shorthand for `run(ctx, operation, { readOnly: true })`.
   */
  async runReadOnly<T>(
    ctx: PlainLiteralObject,
    operation: (txCtx: TransactionContextInterface) => Promise<T>,
  ): Promise<T> {
    return this.run(ctx, operation, { readOnly: true });
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
