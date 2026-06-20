import { RuntimeExceptionOptions } from '@concepta/nestjs-core';

import { LocalInvalidCredentialsException } from '../../infrastructure/strategies/local/exceptions/local-invalid-credentials.exception';

export class LocalInvalidPasswordException extends LocalInvalidCredentialsException {
  constructor(userName: string, options?: RuntimeExceptionOptions) {
    super({
      message: `Invalid password for username: %s`,
      messageParams: [userName],
      ...options,
    });

    this.errorCode = 'AUTH_LOCAL_INVALID_PASSWORD_ERROR';
  }
}
