import { HttpStatus } from '@nestjs/common';

import { RuntimeExceptionOptions } from '@concepta/nestjs-core';

import { AuthenticationException } from '../../domain/exceptions/authentication.exception';

/**
 * Exception for authentication
 */
export class AuthenticationAccessTokenException extends AuthenticationException {
  constructor(options?: Omit<RuntimeExceptionOptions, 'httpStatus'>) {
    super({
      message: 'Access token was verified, but failed further validation.',
      ...options,
      httpStatus: HttpStatus.UNAUTHORIZED,
    });
    this.errorCode = 'AUTHENTICATION_ACCESS_TOKEN_ERROR';
  }
}
