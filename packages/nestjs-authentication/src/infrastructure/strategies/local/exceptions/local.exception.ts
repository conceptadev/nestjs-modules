import { type RuntimeExceptionOptions } from '@concepta/nestjs-core';

import { AuthenticationException } from '../../../../domain/exceptions/authentication.exception';

export class LocalException extends AuthenticationException {
  constructor(options?: RuntimeExceptionOptions) {
    super(options);
    this.errorCode = 'AUTH_LOCAL_ERROR';
  }
}
