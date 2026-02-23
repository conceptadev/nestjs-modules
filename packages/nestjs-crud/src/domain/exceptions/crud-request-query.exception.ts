import { RuntimeExceptionOptions } from '@concepta/nestjs-common';

import { CrudException } from './crud.exception';

export class CrudQueryException extends CrudException {
  constructor(options?: RuntimeExceptionOptions) {
    super(options);
  }
}
