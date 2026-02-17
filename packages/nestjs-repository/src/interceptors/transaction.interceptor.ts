import { Observable } from 'rxjs';

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import {
  getAppContext,
  TransactionContextInterface,
} from '@concepta/nestjs-common';

import { TransactionalRunner } from '../transaction/transactional-runner';

/**
 * Interceptor that wraps requests in transactions.
 *
 * Sets `ctx.trx` on the aggregated app context when a transaction is started.
 * Applied automatically by the `@Transactional()` decorator.
 *
 * @example
 * ```typescript
 * // Controller method with transaction
 * @Post()
 * @Transactional()
 * async createOrder(@Ctx() ctx: OrderContext, @Body() dto: CreateOrderDto) {
 *   // ctx.trx is automatically set by the interceptor
 *   return this.orderService.create(dto, { ctx });
 * }
 * ```
 */
@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(private readonly txRunner: TransactionalRunner) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const ctx = getAppContext<TransactionContextInterface>(req);

    return this.txRunner.run(context.getHandler(), (trx) => {
      ctx.register('trx', trx);
      return next.handle();
    });
  }
}
