import { HttpStatus } from '@nestjs/common';

import { type RuntimeExceptionOptions } from '@concepta/nestjs-core';

import { RefreshException } from './refresh.exception.js';

export class RefreshUnauthorizedException extends RefreshException {
  constructor(options?: Omit<RuntimeExceptionOptions, 'httpStatus'>) {
    super({
      message: `Unauthorized refresh attempt`,
      safeMessage: 'Unauthorized refresh attempt.',
      ...options,
      httpStatus: HttpStatus.UNAUTHORIZED,
      fault: 'client',
    });

    this.errorCode = 'AUTH_REFRESH_NOT_AUTHORIZED_ERROR';
  }
}
