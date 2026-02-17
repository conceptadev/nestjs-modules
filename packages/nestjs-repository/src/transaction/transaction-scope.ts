import { Injectable, Inject, Logger, Optional } from '@nestjs/common';

import {
  TransactionManagerInterface,
  TransactionContextInterface,
} from '@concepta/nestjs-common';

import { TransactionRequiredException } from '../exceptions/transaction-required.exception';
import { TransactionTimeoutException } from '../exceptions/transaction-timeout.exception';
import { RepositoryModuleOptionsInterface } from '../interfaces/repository-module-options.interface';
import { REPOSITORY_MODULE_OPTIONS } from '../repository.constants';

import {
  TransactionFactoryRegistry,
  TRANSACTION_FACTORY_REGISTRY,
} from './transaction-factory-registry';
import { TransactionManager } from './transaction-manager';
import {
  PropagationBehavior,
  TransactionalOptions,
} from './transactional.decorator';

const DEFAULT_TIMEOUT = 30000;

/**
 * Pre-computed propagation resolution results to avoid object allocation per call.
 */
const PROPAGATION_RESULTS = {
  CREATE_NEW: { shouldCreateNew: true, shouldParticipate: false } as const,
  PARTICIPATE: { shouldCreateNew: false, shouldParticipate: true } as const,
  SUPPORTS_EXISTING: {
    shouldCreateNew: false,
    shouldParticipate: true,
  } as const,
  SUPPORTS_NONE: { shouldCreateNew: false, shouldParticipate: false } as const,
  REQUIRED_NEW: { shouldCreateNew: true, shouldParticipate: false } as const,
  REQUIRED_EXISTING: {
    shouldCreateNew: false,
    shouldParticipate: true,
  } as const,
} as const;

/**
 * Orchestrates transaction lifecycle across multiple drivers/datasources.
 * Used by TransactionalRunner and can be used directly for programmatic transactions.
 *
 * @example
 * ```typescript
 * // Programmatic usage
 * await this.transactionScope.run(ctx, async () => {
 *   await this.orders.save(order, { ctx });
 *   await this.inventory.save(inv, { ctx });
 * });
 * ```
 */
@Injectable()
export class TransactionScope {
  private readonly logger = new Logger(TransactionScope.name);
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
   * Execute an operation within transactions for all registered drivers.
   */
  async run<T>(
    ctx: TransactionContextInterface,
    operation: () => Promise<T>,
    options: TransactionalOptions = {},
  ): Promise<T> {
    const propagation = options.propagation ?? 'REQUIRED';
    const readOnly = options.readOnly ?? false;
    const timeout = options.timeout ?? this.defaultTimeout;

    const hasExisting = ctx.trx !== null;

    const { shouldCreateNew, shouldParticipate } = this.resolvePropagation(
      propagation,
      hasExisting,
    );

    // Join existing transactions
    if (shouldParticipate && hasExisting) {
      this.logger.debug(
        `Joining existing transactions (propagation: ${propagation})`,
      );
      return operation();
    }

    // Non-transactional execution
    if (!shouldCreateNew) {
      this.logger.debug(
        `Executing without transaction (propagation: ${propagation})`,
      );
      return operation();
    }

    // Ensure ctx.trx exists (create if first run)
    if (!ctx.trx) {
      ctx.trx = new TransactionManager();
    }

    // Create new transactions for all registered factories
    return this.executeInNewTransactions(ctx.trx, operation, {
      readOnly,
      timeout,
      options,
    });
  }

  /**
   * Execute an operation in read-only transactions.
   * Shorthand for `run(ctx, operation, \{ readOnly: true \})`.
   */
  async runReadOnly<T>(
    ctx: TransactionContextInterface,
    operation: () => Promise<T>,
  ): Promise<T> {
    return this.run(ctx, operation, { readOnly: true });
  }

  private async executeInNewTransactions<T>(
    manager: TransactionManagerInterface,
    operation: () => Promise<T>,
    config: {
      readOnly: boolean;
      timeout: number;
      options: TransactionalOptions;
    },
  ): Promise<T> {
    const { readOnly, timeout, options } = config;

    // No factories registered - execute without transaction overhead
    if (this.registry.count === 0) {
      return operation();
    }

    const factories = this.registry.getAll();

    // Pre-allocate keys array based on factory count
    const keys: string[] = new Array(factories.size);
    let keyIndex = 0;

    // Lazy timeout - only created when we have transactions to manage
    let timeoutHandle: NodeJS.Timeout | undefined;
    let timeoutPromise: Promise<never> | undefined;

    try {
      // Push new transactions onto the stack
      for (const [key, factory] of factories) {
        const tx = factory.create();
        await tx.start();
        manager.push(key, tx);
        keys[keyIndex++] = key;
        this.logger.debug(
          `Started transaction for ${key} (readOnly: ${readOnly})`,
        );
      }

      // Create timeout promise only after transactions are started
      timeoutPromise = new Promise<never>((_, reject) => {
        timeoutHandle = setTimeout(() => {
          reject(new TransactionTimeoutException(timeout));
        }, timeout);
      });

      const result = await Promise.race([operation(), timeoutPromise]);

      await this.finalize(manager, readOnly);
      return result;
    } catch (error) {
      await this.handleError(manager, error, options);
      throw error;
    } finally {
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
      }
      // Pop all transactions we pushed
      for (let i = 0; i < keyIndex; i++) {
        manager.pop(keys[i]);
      }
    }
  }

  private resolvePropagation(
    propagation: PropagationBehavior,
    hasExisting: boolean,
  ): {
    readonly shouldCreateNew: boolean;
    readonly shouldParticipate: boolean;
  } {
    switch (propagation) {
      case 'REQUIRED':
        // Join existing or create new
        return hasExisting
          ? PROPAGATION_RESULTS.REQUIRED_EXISTING
          : PROPAGATION_RESULTS.REQUIRED_NEW;

      case 'REQUIRES_NEW':
        // Always create new, suspend existing
        return PROPAGATION_RESULTS.CREATE_NEW;

      case 'SUPPORTS':
        // Use existing if available, else non-transactional
        return hasExisting
          ? PROPAGATION_RESULTS.SUPPORTS_EXISTING
          : PROPAGATION_RESULTS.SUPPORTS_NONE;

      case 'MANDATORY':
        // Must have existing
        if (!hasExisting) {
          throw new TransactionRequiredException();
        }
        return PROPAGATION_RESULTS.PARTICIPATE;

      default:
        return PROPAGATION_RESULTS.CREATE_NEW;
    }
  }

  private async finalize(
    manager: TransactionManagerInterface,
    readOnly: boolean,
  ): Promise<void> {
    if (readOnly) {
      this.logger.debug('Rolling back all read-only transactions');
      await manager.rollbackAll();
    } else {
      this.logger.debug(
        'Committing dirty transactions, rolling back clean ones',
      );
      await manager.commitAll();
    }
  }

  private async handleError(
    manager: TransactionManagerInterface,
    error: unknown,
    options: TransactionalOptions,
  ): Promise<void> {
    // Check if this error type should skip rollback
    const skipRollback = options.noRollbackFor?.some(
      (type) => error instanceof type,
    );

    if (skipRollback) {
      this.logger.debug('Committing despite error (noRollbackFor match)');
      try {
        await manager.commitAll();
        return;
      } catch (commitError) {
        this.logger.error(
          'Commit failed after noRollbackFor match:',
          commitError,
        );
        // Fall through to rollback
      }
    }

    this.logger.debug('Rolling back all transactions due to error');

    try {
      await manager.rollbackAll();
    } catch (rollbackError) {
      this.logger.error('Rollback failed:', rollbackError);
    }
  }
}
