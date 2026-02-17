import { SetMetadata, UseInterceptors, applyDecorators } from '@nestjs/common';

import { TransactionInterceptor } from '../interceptors/transaction.interceptor';
import {
  PropagationBehavior,
  TransactionalOptions,
} from '../interfaces/transactional-options.interface';

export { PropagationBehavior, TransactionalOptions };

export const TRANSACTIONAL_KEY = Symbol('Transactional');

/**
 * Method decorator to wrap handler in a transaction.
 *
 * @example
 * ```typescript
 * @Post()
 * @Transactional()
 * async createOrder(@Ctx() ctx: Context, @Body() dto: CreateOrderDto) {
 *   // All repository operations within this handler share the same transaction
 *   return this.orderService.create(ctx, dto);
 * }
 *
 * @Get(':id')
 * @Transactional({ readOnly: true })
 * async getOrder(@Ctx() ctx: Context, @Param('id') id: string) {
 *   // Read-only transaction, always rolls back
 *   return this.orderService.findById(ctx, id);
 * }
 * ```
 */
export function Transactional(
  options: TransactionalOptions = {},
): MethodDecorator {
  const resolvedOptions: TransactionalOptions = {
    propagation: options.propagation ?? 'REQUIRED',
    readOnly: options.readOnly ?? false,
    noRollbackFor: options.noRollbackFor ?? [],
    timeout: options.timeout, // Let TransactionScope apply module default
  };

  return applyDecorators(
    SetMetadata(TRANSACTIONAL_KEY, resolvedOptions),
    UseInterceptors(TransactionInterceptor),
  );
}
