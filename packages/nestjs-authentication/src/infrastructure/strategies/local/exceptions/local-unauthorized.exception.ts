import { HttpStatus } from '@nestjs/common';

import { RuntimeExceptionOptions } from '@concepta/nestjs-common';

import { LocalException } from './local.exception';

export class LocalUnauthorizedException extends LocalException {
  constructor(options?: Omit<RuntimeExceptionOptions, 'httpStatus'>) {
    super({
      message: 'Unauthorized',
      safeMessage: 'Unauthorized',
      ...options,
      httpStatus: HttpStatus.UNAUTHORIZED,
    });

    this.errorCode = 'AUTH_LOCAL_UNAUTHORIZED_ERROR';
  }
}
