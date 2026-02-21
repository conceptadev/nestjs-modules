import { Observable, from, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Injectable, PlainLiteralObject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

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
 *   const ctx = getAppContext<TransactionContextInterface>(req);
 *   return this.txRunner.run(
 *     context.getHandler(),
 *     context.getClass(),
 *     ctx,
 *     () => next.handle(),
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
   * Checks method-level metadata first, then class-level.
   * `@Transactional(false)` on a method disables the class-level transaction.
   *
   * @param handler - The method handler to check for `@Transactional()` metadata
   * @param controller - The controller class to check for class-level `@Transactional()` metadata
   * @param ctx - The context for this request
   * @param operation - The operation to run
   * @returns An Observable of the result
   */
  run<T>(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    handler: Function,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    controller: Function,
    ctx: PlainLiteralObject,
    operation: () => Observable<T>,
  ): Observable<T> {
    const options = this.reflector.getAllAndOverride<
      TransactionalOptions | false
    >(TRANSACTIONAL_KEY, [handler, controller]);

    if (!options) {
      return operation();
    }

    return from(
      this.txScope.run(ctx, () => this.toPromise(operation()), {
        propagation: options.propagation,
        readOnly: options.readOnly,
        timeout: options.timeout,
      }),
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
