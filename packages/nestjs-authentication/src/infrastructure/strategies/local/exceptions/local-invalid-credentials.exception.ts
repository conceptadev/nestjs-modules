import { RuntimeExceptionOptions } from '@concepta/nestjs-common';

import { LocalUnauthorizedException } from './local-unauthorized.exception';

export class LocalInvalidCredentialsException extends LocalUnauthorizedException {
  constructor(options?: Omit<RuntimeExceptionOptions, 'httpStatus'>) {
    super({
      safeMessage:
        'The provided username or password is incorrect. Please try again.',
      ...options,
    });

    this.errorCode = 'AUTH_LOCAL_INVALID_CREDENTIALS_ERROR';
  }
}
