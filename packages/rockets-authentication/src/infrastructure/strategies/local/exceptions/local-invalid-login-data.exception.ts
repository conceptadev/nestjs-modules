import { HttpStatus } from '@nestjs/common';

import { RuntimeExceptionOptions } from '@concepta/rockets-app';

import { LocalException } from './local.exception';

export class LocalInvalidLoginDataException extends LocalException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      message: 'Data validation error occurred before user validation.',
      safeMessage: 'The login data provided is invalid.',
      httpStatus: HttpStatus.BAD_REQUEST,
      ...options,
    });

    this.errorCode = 'AUTH_LOCAL_INVALID_LOGIN_DATA_ERROR';
  }
}
