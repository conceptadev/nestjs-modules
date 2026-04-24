import { RuntimeExceptionOptions } from '@concepta/nestjs-common';

import { AuthenticationException } from '../../../../domain/exceptions/authentication.exception';

export class RefreshException extends AuthenticationException {
  constructor(options?: RuntimeExceptionOptions) {
    super(options);
    this.errorCode = 'AUTH_REFRESH_ERROR';
  }
}
