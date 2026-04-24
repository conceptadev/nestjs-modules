import { HttpStatus } from '@nestjs/common';

import { RuntimeExceptionOptions } from '@concepta/nestjs-common';

import { JwtException } from './jwt.exception';

/**
 * Generic exception.
 */
export class JwtVerifyException extends JwtException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      safeMessage: 'Error on JWT verification',
      httpStatus: HttpStatus.UNAUTHORIZED,
      ...options,
    });
    this.errorCode = 'JWT_VERIFY_ERROR';
  }
}
