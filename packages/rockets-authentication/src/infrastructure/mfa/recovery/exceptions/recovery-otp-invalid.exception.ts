import { HttpStatus } from '@nestjs/common';

import { RuntimeExceptionOptions } from '@concepta/rockets-app';

import { RecoveryException } from './recovery.exception';

export class RecoveryOtpInvalidException extends RecoveryException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      message: `Invalid recovery code provided`,
      httpStatus: HttpStatus.BAD_REQUEST,
      ...options,
    });

    this.errorCode = 'AUTH_RECOVERY_OTP_INVALID_ERROR';
  }
}
