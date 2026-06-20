import { SetMetadata, UseInterceptors, applyDecorators } from '@nestjs/common';

import { TransactionInterceptor } from '../interceptors/transaction.interceptor';
import {
  PropagationBehavior,
  TransactionalOptions,
} from '../interfaces/transactional-options.interface';

export { PropagationBehavior, TransactionalOptions };

export const TRANSACTIONAL_KEY = Symbol('Transactional');

/**
 * Decorator to wrap operations in a transaction.
 *
 * Can be applied at the class level (all methods) or method level.
 * Method-level settings override class-level settings.
 * Pass `false` to disable transactions for a specific method.
 *
 * @example
 * ```typescript
 * // Class-level: all routes are transactional
 * @Controller('orders')
 * @Transactional()
 * class OrderController {
 *   @Post()
 *   async create(@Ctx() ctx, @Body() dto) { ... }
 *
 *   // Override: disable transaction for this route
 *   @Get()
 *   @Transactional(false)
 *   async list(@Ctx() ctx) { ... }
 *
 *   // Override: read-only transaction for this route
 *   @Get(':id')
 *   @Transactional({ readOnly: true })
 *   async read(@Ctx() ctx) { ... }
 * }
 * ```
 */
export function Transactional(options?: TransactionalOptions | false) {
  // Explicit opt-out: set metadata to false so the runner skips this method
  if (options === false) {
    return SetMetadata(TRANSACTIONAL_KEY, false);
  }

  const resolvedOptions: TransactionalOptions = {
    propagation: options?.propagation ?? 'SUPPORTS',
    readOnly: options?.readOnly ?? false,
    noRollbackFor: options?.noRollbackFor ?? [],
    timeout: options?.timeout, // Let Transaction apply module default
  };

  return applyDecorators(
    SetMetadata(TRANSACTIONAL_KEY, resolvedOptions),
    UseInterceptors(TransactionInterceptor),
  );
}
