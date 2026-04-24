import { HttpStatus } from '@nestjs/common';

import { RuntimeExceptionOptions } from '@concepta/nestjs-common';

import { JwtAuthenticationException } from './jwt-authentication.exception';

export class JwtUnauthorizedException extends JwtAuthenticationException {
  constructor(options?: Omit<RuntimeExceptionOptions, 'httpStatus'>) {
    super({
      safeMessage: 'Unable to authenticate user with provided JWT token.',
      ...options,
      httpStatus: HttpStatus.UNAUTHORIZED,
    });

    this.errorCode = 'AUTH_JWT_UNAUTHORIZED_ERROR';
  }
}
