import { RuntimeExceptionOptions } from '@concepta/nestjs-common';

import { AuthRouterException } from './auth-router.exception';

export class AuthRouterProviderMissingException extends AuthRouterException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      safeMessage:
        'Auth Router provider is required in the request query parameters.',
      ...options,
    });

    this.errorCode = 'AUTH_ROUTER_PROVIDER_MISSING_ERROR';
  }
}
