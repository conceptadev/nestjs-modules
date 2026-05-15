import { ValidationError } from 'class-validator';

import { RuntimeExceptionOptions } from '@concepta/rockets-app';

import { OtpException } from './otp.exception';

export class OtpValidationException extends OtpException {
  context: OtpException['context'] & {
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

    this.context = { ...super.context, entityName, validationErrors };
    this.errorCode = 'OTP_VALIDATION_ERROR';
  }
}
