import { RuntimeExceptionOptions } from '@concepta/nestjs-common';

import { AuthRouterException } from './auth-router.exception';

export class AuthRouterGuardInvalidException extends AuthRouterException {
  constructor(provider: string, options?: RuntimeExceptionOptions) {
    super({
      safeMessage: `Invalid guard configuration for Auth Router provider '${provider}'.`,
      ...options,
    });

    this.errorCode = 'AUTH_ROUTER_GUARD_INVALID_ERROR';
  }
}
