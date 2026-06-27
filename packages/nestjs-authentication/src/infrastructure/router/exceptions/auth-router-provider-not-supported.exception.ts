import { type RuntimeExceptionOptions } from '@concepta/nestjs-core';

import { AuthRouterException } from './auth-router.exception';

export class AuthRouterProviderNotSupportedException extends AuthRouterException {
  constructor(provider: string, options?: RuntimeExceptionOptions) {
    super({
      safeMessage: `Auth Router provider '${provider}' is not supported.`,
      ...options,
    });

    this.errorCode = 'AUTH_ROUTER_PROVIDER_NOT_SUPPORTED_ERROR';
  }
}
