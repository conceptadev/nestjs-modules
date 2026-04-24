import { RuntimeExceptionOptions } from '@concepta/nestjs-common';

import { AuthRouterException } from './auth-router.exception';

export class AuthRouterConfigNotAvailableException extends AuthRouterException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      safeMessage: 'Auth Router configuration is not available or invalid.',
      ...options,
    });

    this.errorCode = 'AUTH_ROUTER_CONFIG_NOT_AVAILABLE_ERROR';
  }
}
