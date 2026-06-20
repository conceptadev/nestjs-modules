import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-core';

import { OtpException } from '../../domain/exceptions/otp.exception';

export class OtpEntityNotFoundException extends OtpException {
  context: RuntimeException['context'] & {
    entityName: string;
  };

  constructor(entityName: string, options?: RuntimeExceptionOptions) {
    super({
      message: 'Entity %s was not registered to be used.',
      messageParams: [entityName],
      ...options,
    });

    this.context = {
      ...super.context,
      entityName,
    };

    this.errorCode = 'OTP_ENTITY_NOT_FOUND_ERROR';
  }
}
