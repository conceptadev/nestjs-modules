import { HttpStatus } from '@nestjs/common';

import { RuntimeExceptionOptions } from '@concepta/nestjs-common';

import { CrudException } from './crud.exception';

/**
 * Crud context exception.
 */
export class CrudContextException extends CrudException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      safeMessage: 'Error on crud context processing',
      httpStatus: HttpStatus.BAD_REQUEST,
      ...options,
    });
    this.errorCode = 'CRUD_CONTEXT_ERROR';
  }
}
