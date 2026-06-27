import { HttpStatus } from '@nestjs/common';

import { type RuntimeExceptionOptions } from '@concepta/nestjs-core';

import { PasswordException } from './password.exception';

export class PasswordUsedRecentlyException extends PasswordException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      message:
        'The new password has been used too recently, please use a different password',
      httpStatus: HttpStatus.BAD_REQUEST,
      ...options,
    });

    this.errorCode = 'PASSWORD_USED_RECENTLY_ERROR';
  }
}
