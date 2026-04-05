import { HttpStatus } from '@nestjs/common';

import { RuntimeExceptionOptions } from '@concepta/nestjs-common';

import { PasswordException } from './password.exception';

export class PasswordCurrentRequiredException extends PasswordException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      message: 'Current password is required',
      httpStatus: HttpStatus.BAD_REQUEST,
      ...options,
    });

    this.errorCode = 'PASSWORD_CURRENT_REQUIRED_ERROR';
  }
}
