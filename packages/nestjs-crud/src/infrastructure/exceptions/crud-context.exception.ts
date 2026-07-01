import { type RuntimeExceptionOptions } from '@concepta/nestjs-core';

import { CrudException } from './crud.exception';

/**
 * Crud context exception.
 */
export class CrudContextException extends CrudException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      safeMessage: 'Error on crud context processing',
      ...options,
    });
    this.errorCode = 'CRUD_CONTEXT_ERROR';
  }
}
