import { HttpStatus } from '@nestjs/common';

import { RuntimeExceptionOptions } from '@concepta/rockets-app';

import { VerifyException } from '../../infrastructure/mfa/verify/exceptions/verify.exception';

export class VerifyOtpInvalidException extends VerifyException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      message: `Invalid confirmation code provided`,
      httpStatus: HttpStatus.BAD_REQUEST,
      ...options,
    });

    this.errorCode = 'AUTH_VERIFY_OTP_INVALID_ERROR';
  }
}
