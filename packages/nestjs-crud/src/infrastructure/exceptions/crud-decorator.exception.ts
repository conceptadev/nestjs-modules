import { RuntimeExceptionOptions } from '@concepta/rockets-app';

import { CrudException } from './crud.exception';

export class CrudDecoratorException extends CrudException {
  constructor(options?: RuntimeExceptionOptions) {
    super(options);
    this.errorCode = 'CRUD_DECORATOR_ERROR';
  }
}
