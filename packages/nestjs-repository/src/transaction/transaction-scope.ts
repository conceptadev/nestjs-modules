import {
  Injectable,
  Inject,
  Optional,
  PlainLiteralObject,
} from '@nestjs/common';

import { AppContextHost } from '@concepta/nestjs-core';

import { TransactionRequiredException } from '../exceptions/transaction-required.exception.js';
import { TransactionTimeoutException } from '../exceptions/transaction-timeout.exception.js';
import { RepositoryModuleOptionsInterface } from '../interfaces/repository-module-options.interface.js';
import { PropagationBehavior } from '../interfaces/transactional-options.interface.js';
import { REPOSITORY_MODULE_OPTIONS } from '../repository.constants.js';

import {
  TransactionContextInterface,
  TrxCtx,
} from './interfaces/transaction-context.interface.js';
import {
  TransactionFactoryRegistry,
  TRANSACTION_FACTORY_REGISTRY,
} from './transaction-factory-registry.js';
import { TransactionManager } from './transaction-manager.js';

const DEFAULT_TIMEOUT = 30000;

export interface TransactionRunOptions {
  propagation?: PropagationBehavior;
  readOnly?: boolean;
  timeout?: number;
}

/**
 * Orchestrates transaction lifecycle.
 *
 * Every unit of work calls `run()`. The first `run()` on a given context
 * defines `TrxCtx` and owns the scope; concurrent/nested `run()` calls on
 * the same context detect `TrxCtx` is already defined and join it — all
 * participants share one `TransactionManager`, refcounted via
 * `enter()`/`exit()`. The scope settles (commits/rolls back, flushes
 * callbacks, and removes `TrxCtx` from the context) only when the last
 * participant exits, so the context is left exactly as `run()` found it and
 * a later, unrelated `run()` on the same context starts a fresh scope.
 *
 * The `TransactionManager` is also re-declared directly on the run-scoped
 * `txCtx` child, so a handle held past its scope's settlement (e.g. an
 * operation that outlived a timeout) keeps resolving `TrxCtx` — its next
 * `getOrStart()` call throws `TransactionClosedException` rather than
 * silently falling through to non-transactional access.
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
   * Defines `TrxCtx` on the context if not already present, then runs the
   * full lifecycle ceremony. Nesting/concurrency is detected via
   * `ctx.supports(TrxCtx)`; participants share one scope, refcounted via
   * `enter()`/`exit()`, and the scope settles when the last one exits.
   */
  async run<T>(
    ctx: PlainLiteralObject,
    operation: (txCtx: TransactionContextInterface) => Promise<T>,
    options?: TransactionRunOptions,
  ): Promise<T> {
    const appCtx = AppContextHost.from(ctx);
    const propagation = options?.propagation ?? 'SUPPORTS';
    const timeout = options?.timeout ?? this.defaultTimeout;

    // MANDATORY: require real transaction support. Checked before any
    // overlay is installed, so a rejected run leaves the context untouched.
    if (propagation === 'MANDATORY' && this.registry.count === 0) {
      throw new TransactionRequiredException();
    }

    if (!appCtx.supports(TrxCtx)) {
      appCtx.defineOverlay(TrxCtx, {
        trx: new TransactionManager(this.registry, options?.readOnly ?? false),
      });
    }

    const txCtx = appCtx.with(TrxCtx);
    const { trx } = txCtx;

    // Re-declared on the run-scoped child — see class-level doc comment.
    AppContextHost.from(txCtx).defineOverlay(TrxCtx, { trx });

    trx.enter();

    try {
      return await this.withTimeout(operation(txCtx), timeout);
    } catch (error) {
      trx.markFailed();
      throw error;
    } finally {
      if (trx.exit() === 0) {
        await this.settle(appCtx, trx);
      }
    }
  }

  /**
   * Settle a scope once its last participant has exited: commit or roll
   * back, close the scope and remove `TrxCtx` — so a callback doing
   * repository work on the same ctx gets non-transactional access rather
   * than the just-settled transaction — then flush the matching callbacks.
   */
  private async settle(
    appCtx: AppContextHost,
    trx: TransactionManager,
  ): Promise<void> {
    let settleError: unknown;

    try {
      if (trx.hasFailed || trx.isReadOnly) {
        await trx.rollbackAll();
      } else {
        await trx.commitAll();
      }
    } catch (error) {
      trx.markFailed();
      settleError = error;
      await trx.rollbackAll();
    }

    trx.close();
    appCtx.removeOverlay(TrxCtx);

    if (trx.hasFailed || trx.isReadOnly) {
      await trx.flushOnRollbackCallbacks();
    } else {
      await trx.flushOnCommitCallbacks();
    }

    if (settleError !== undefined) {
      throw settleError;
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
