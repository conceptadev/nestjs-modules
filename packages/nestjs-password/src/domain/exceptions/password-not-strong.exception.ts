import { HttpStatus } from '@nestjs/common';

import { RuntimeExceptionOptions } from '@concepta/nestjs-common';

import { PasswordException } from './password.exception';

export class PasswordNotStrongException extends PasswordException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      message: 'Password is not strong enough',
      httpStatus: HttpStatus.BAD_REQUEST,
      ...options,
    });

    this.errorCode = 'PASSWORD_NOT_STRONG_ERROR';
  }
}
