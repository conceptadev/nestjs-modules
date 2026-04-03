import { ExecutionContext, Injectable } from '@nestjs/common';

import {
  ContextOverlayInterceptor,
  getAppContext,
  OverlayRef,
  UserEntityInterface,
} from '@concepta/nestjs-common';

export const AuthorizedUserRef = new OverlayRef<
  'withAuthorizedUser',
  UserEntityInterface
>('withAuthorizedUser');

@Injectable()
export class AuthorizedUserOverlayFixture extends ContextOverlayInterceptor {
  readonly ref = AuthorizedUserRef;

  async attach(context: ExecutionContext): Promise<void> {
    const req = context.switchToHttp().getRequest();
    getAppContext(req).defineOverlay(this.ref, req.user);
  }
}
