import { Injectable, Inject, Optional } from '@nestjs/common';

import { AppContextHost, AppContextLike } from '@concepta/nestjs-common';

import { TrxCtx } from '../context/interfaces/transaction-context.interface';
import { TransactionRequiredException } from '../exceptions/transaction-required.exception';
import { TransactionTimeoutException } from '../exceptions/transaction-timeout.exception';
import { RepositoryModuleOptionsInterface } from '../interfaces/repository-module-options.interface';
import { PropagationBehavior } from '../interfaces/transactional-options.interface';
import { REPOSITORY_MODULE_OPTIONS } from '../repository.constants';

import { TransactionHandleInterface } from './interfaces/transaction-handle.interface';
import { TransactionContextOverlay } from './transaction-context.overlay';

const DEFAULT_TIMEOUT = 30000;

export interface TransactionRunOptions {
  propagation?: PropagationBehavior;
  readOnly?: boolean;
  timeout?: number;
}

/**
 * Orchestrates transaction lifecycle.
 *
 * Every unit of work calls `run()`. The first (outermost) call becomes
 * the lifecycle owner — it commits/rolls back and flushes callbacks.
 * Nested `run()` calls join the existing transaction.
 *
 * The `withTrx` overlay is defined eagerly by
 * {@link TransactionContextOverlay} when an interceptor is present.
 * For direct calls (command handlers, CLI), the scope defines it
 * on first access via the overlay's `resolve()`.
 *
 * @example
 * ```typescript
 * async execute(command: CreateCacheCommand): Promise<CacheInterface> {
 *   const { context, dto } = command;
 *   return this.txScope.run(context, async (trx) => {
 *     const cache = Cache.create(dto, this.settings);
 *     await cacheRepo.save({ dto: cache.toPlain(), ctx: context });
 *     trx.onCommit(() => cache.commit());
 *     return cache.toPlain();
 *   });
 * }
 * ```
 */
@Injectable()
export class TransactionScope {
  private readonly defaultTimeout: number;

  constructor(
    private readonly overlay: TransactionContextOverlay,
    @Optional()
    @Inject(REPOSITORY_MODULE_OPTIONS)
    options?: RepositoryModuleOptionsInterface,
  ) {
    this.defaultTimeout = options?.defaultTimeout ?? DEFAULT_TIMEOUT;
  }

  /**
   * Execute an operation within a transaction scope.
   *
   * Ensures the `withTrx` overlay is defined, then checks the
   * transaction manager's active state. The first `run()` call owns
   * the lifecycle; nested calls join the existing transaction.
   */
  async run<T>(
    ctx: AppContextLike,
    operation: (trx: TransactionHandleInterface) => Promise<T>,
    options?: TransactionRunOptions,
  ): Promise<T> {
    const propagation = options?.propagation ?? 'REQUIRED';
    const readOnly = options?.readOnly ?? false;
    const timeout = options?.timeout ?? this.defaultTimeout;

    const context = AppContextHost.from(ctx);

    // Ensure withTrx overlay exists (no-op if already defined by interceptor)
    context.define(TrxCtx, this.overlay.resolve());

    const { trx } = context.with(TrxCtx);

    // MANDATORY: require an already-active transaction
    if (propagation === 'MANDATORY' && !trx.isActive) {
      throw new TransactionRequiredException();
    }

    // SUPPORTS without active transaction: run without transaction
    if (propagation === 'SUPPORTS' && !trx.isActive) {
      return operation({ onCommit: () => {}, onRollback: () => {} });
    }

    // Scoped handle
    const handle: TransactionHandleInterface = {
      onCommit: (fn) => trx.onCommit(fn),
      onRollback: (fn) => trx.onRollback(fn),
    };

    // Join existing transaction (nested call)
    if (trx.isActive) {
      return operation(handle);
    }

    // I'm the outermost — claim the manager and own the lifecycle
    trx.claim();

    try {
      const result = await this.withTimeout(operation(handle), timeout);

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
    ctx: AppContextLike,
    operation: (trx: TransactionHandleInterface) => Promise<T>,
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
