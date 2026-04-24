import { ExecutionContext, Injectable } from '@nestjs/common';

import {
  ContextOverlayInterceptor,
  getAppContext,
  OverlayRef,
} from '@concepta/nestjs-common';

import { AuthenticatedUserInterface } from '../domain/interfaces/authenticated-user.interface';

import { AuthUserContextInterface } from './interfaces/auth-user-context.interface';

export const AuthUserCtx = new OverlayRef<
  'withAuthUser',
  AuthUserContextInterface
>('withAuthUser');

@Injectable()
export class AuthUserContextOverlay extends ContextOverlayInterceptor {
  readonly ref = AuthUserCtx;

  attach(context: ExecutionContext): void {
    const request = context
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUserInterface }>();
    const ctx = getAppContext(request);
    ctx.defineOverlay(AuthUserCtx, { user: request.user });
  }
}
