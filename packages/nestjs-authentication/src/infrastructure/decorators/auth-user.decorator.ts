import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { getAppContext } from '@concepta/rockets-app';

import { AuthUserCtx } from '../../gateways/auth-user-context.overlay';

export const AuthUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return getAppContext(request).with(AuthUserCtx).user;
  },
);
