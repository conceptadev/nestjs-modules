import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-core';

export class AuthenticationEmailException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super(options);
    this.errorCode = 'AUTHENTICATION_EMAIL_ERROR';
  }
}
