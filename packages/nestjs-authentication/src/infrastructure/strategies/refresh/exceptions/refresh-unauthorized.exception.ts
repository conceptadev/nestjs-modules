import { HttpStatus } from '@nestjs/common';

import { RuntimeExceptionOptions } from '@concepta/nestjs-common';

import { RefreshException } from './refresh.exception';

export class RefreshUnauthorizedException extends RefreshException {
  constructor(options?: Omit<RuntimeExceptionOptions, 'httpStatus'>) {
    super({
      message: `Unauthorized refresh attempt`,
      safeMessage: 'Unauthorized refresh attempt.',
      ...options,
      httpStatus: HttpStatus.UNAUTHORIZED,
    });

    this.errorCode = 'AUTH_REFRESH_NOT_AUTHORIZED_ERROR';
  }
}
