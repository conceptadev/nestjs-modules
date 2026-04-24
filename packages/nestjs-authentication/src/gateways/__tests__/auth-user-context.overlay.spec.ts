import { mock } from 'jest-mock-extended';

import { ExecutionContext, HttpArgumentsHost } from '@nestjs/common/interfaces';

import { getAppContext } from '@concepta/nestjs-common';

import {
  AuthUserCtx,
  AuthUserContextOverlay,
} from '../auth-user-context.overlay';

const makeCtx = (request: object): ExecutionContext => {
  const httpArgsHost = mock<HttpArgumentsHost>();
  httpArgsHost.getRequest.mockReturnValue(request);
  const ctx = mock<ExecutionContext>();
  ctx.switchToHttp.mockReturnValue(httpArgsHost);
  return ctx;
};

describe(AuthUserContextOverlay.name, () => {
  let overlay: AuthUserContextOverlay;

  beforeEach(() => {
    overlay = new AuthUserContextOverlay();
  });

  it('should define AuthUserCtx with user from request', () => {
    const user = { id: 'user-1' };
    const request = { user };
    overlay.attach(makeCtx(request));
    expect(getAppContext(request).with(AuthUserCtx)).toEqual({ user });
  });

  it('should define AuthUserCtx with user undefined when request has no user', () => {
    const request = {};
    overlay.attach(makeCtx(request));
    expect(getAppContext(request).with(AuthUserCtx)).toEqual({
      user: undefined,
    });
  });

  it('should be idempotent when attached twice', () => {
    const user = { id: 'user-1' };
    const request = { user };
    overlay.attach(makeCtx(request));
    request.user = { id: 'user-2' };
    overlay.attach(makeCtx(request));
    expect(getAppContext(request).with(AuthUserCtx).user?.id).toBe('user-1');
  });
});
