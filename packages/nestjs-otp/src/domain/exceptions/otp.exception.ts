import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/rockets-app';

export class OtpException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super(options);
    this.errorCode = 'OTP_ERROR';
  }
}
