import { Observable } from 'rxjs';

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { getAppContext } from '@concepta/nestjs-common';

import { TransactionContextInterface } from '../context/interfaces/transaction-context.interface';
import { TransactionalRunner } from '../transaction/transactional-runner';

/**
 * Interceptor that wraps requests in transactions.
 *
 * Delegates to `TransactionalRunner` which delegates to `TransactionScope.run()`.
 * The scope registers `trx` on the context automatically.
 *
 * Applied automatically by the `@Transactional()` decorator.
 */
@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(private readonly txRunner: TransactionalRunner) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const ctx = getAppContext<TransactionContextInterface>(req);

    return this.txRunner.run(
      context.getHandler(),
      context.getClass(),
      ctx,
      () => next.handle(),
    );
  }
}
