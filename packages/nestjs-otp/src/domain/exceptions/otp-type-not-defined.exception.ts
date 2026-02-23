import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-common';

import { OtpException } from './otp.exception';

export class OtpTypeNotDefinedException extends OtpException {
  context: RuntimeException['context'] & {
    type: string;
  };

  constructor(type: string, options?: RuntimeExceptionOptions) {
    super({
      message: 'Type %s was not defined to be used. please check config.',
      messageParams: [type],
      ...options,
    });

    this.context = {
      ...super.context,
      type,
    };

    this.errorCode = 'OTP_TYPE_NOT_DEFINED_ERROR';
  }
}
