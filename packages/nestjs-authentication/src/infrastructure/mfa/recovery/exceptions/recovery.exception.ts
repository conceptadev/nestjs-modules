import { RuntimeExceptionOptions } from '@concepta/nestjs-core';

import { AuthenticationException } from '../../../../domain/exceptions/authentication.exception';

export class RecoveryException extends AuthenticationException {
  constructor(options?: RuntimeExceptionOptions) {
    super(options);
    this.errorCode = 'AUTH_RECOVERY_ERROR';
  }
}
