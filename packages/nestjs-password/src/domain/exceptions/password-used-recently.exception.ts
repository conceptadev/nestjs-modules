import { HttpStatus } from '@nestjs/common';

import { RuntimeExceptionOptions } from '@concepta/nestjs-common';

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
