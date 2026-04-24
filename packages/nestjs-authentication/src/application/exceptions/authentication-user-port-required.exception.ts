import { HttpStatus } from '@nestjs/common';

import { RuntimeExceptionOptions } from '@concepta/nestjs-common';

import { AuthenticationException } from '../../domain/exceptions/authentication.exception';

/**
 * Exception thrown when requireUserValidation is enabled but no user port is configured.
 */
export class AuthenticationUserPortRequiredException extends AuthenticationException {
  constructor(options?: Omit<RuntimeExceptionOptions, 'httpStatus'>) {
    super({
      message:
        'User port is required when requireUserValidation is enabled, but no user port was configured.',
      ...options,
      httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
    });
    this.errorCode = 'AUTHENTICATION_USER_PORT_REQUIRED_ERROR';
  }
}
