import { Observable, from, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import {
  TransactionManagerInterface,
  TransactionContextInterface,
} from '@concepta/nestjs-common';

import { TransactionScope } from './transaction-scope';
import {
  TRANSACTIONAL_KEY,
  TransactionalOptions,
} from './transactional.decorator';

/**
 * Helper for running operations within transactions.
 *
 * Checks for `@Transactional()` metadata on the handler and wraps the
 * operation in a transaction if present. Designed to be used by
 * interceptors in consuming modules.
 *
 * @example
 * ```typescript
 * // In an interceptor
 * intercept(context: ExecutionContext, next: CallHandler) {
 *   return this.txRunner.run(
 *     context.getHandler(),
 *     (trx) => {
 *       // trx is the TransactionManagerInterface, or null
 *       myContext.trx = trx;
 *       return next.handle();
 *     },
 *   );
 * }
 * ```
 */
@Injectable()
export class TransactionalRunner {
  constructor(
    private readonly reflector: Reflector,
    private readonly txScope: TransactionScope,
  ) {}

  /**
   * Run an operation, wrapping in a transaction if `@Transactional()` is present.
   *
   * @param handler - The method handler to check for `@Transactional()` metadata
   * @param operation - The operation to run, receives the transaction manager (or null)
   * @returns An Observable of the result
   */
  run<T>(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    handler: Function,
    operation: (trx: TransactionManagerInterface | null) => Observable<T>,
  ): Observable<T> {
    const options = this.reflector.get<TransactionalOptions>(
      TRANSACTIONAL_KEY,
      handler,
    );

    if (!options) {
      return operation(null);
    }

    // Create a minimal context to hold the trx
    const ctx: TransactionContextInterface = { trx: null };

    return from(
      this.txScope.run(ctx, () => this.toPromise(operation(ctx.trx)), options),
    ).pipe(catchError((error) => throwError(() => error)));
  }

  /**
   * Convert Observable to Promise.
   */
  private toPromise<T>(observable: Observable<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      let result: T;
      observable.subscribe({
        next: (value) => {
          result = value;
        },
        error: (err) => reject(err),
        complete: () => resolve(result),
      });
    });
  }
}
