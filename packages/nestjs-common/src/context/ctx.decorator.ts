import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { getAppContext } from './get-app-context.util';

/**
 * Parameter decorator to inject the per-request application context.
 *
 * @example
 * ```typescript
 * interface MyContext {
 *   auth: { userId: string; tenantId: string };
 * }
 *
 * @Get()
 * getProfile(@Ctx() ctx: MyContext) {
 *   return this.userService.findById(ctx.auth.userId);
 * }
 * ```
 */
export const Ctx = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) =>
    getAppContext(ctx.switchToHttp().getRequest()),
);
