import { type ValidationError } from 'class-validator';

import { type RuntimeExceptionOptions } from '@concepta/nestjs-core';

import { OtpException } from './otp.exception.js';

export class OtpValidationException extends OtpException {
  declare context: OtpException['context'] & {
    entityName: string;
    validationErrors: ValidationError[];
  };

  constructor(
    entityName: string,
    validationErrors: ValidationError[],
    options?: RuntimeExceptionOptions,
  ) {
    super({
      message: 'Data for the %s OTP DTO is not valid',
      messageParams: [entityName],
      ...options,
    });

    this.context = { ...this.context, entityName, validationErrors };
    this.errorCode = 'OTP_VALIDATION_ERROR';
  }
}
