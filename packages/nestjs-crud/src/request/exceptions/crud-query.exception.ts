import { RuntimeExceptionOptions } from '@concepta/nestjs-common';

import { CrudException } from '../../exceptions/crud.exception';

export class CrudQueryException extends CrudException {
  constructor(options?: RuntimeExceptionOptions) {
    super(options);
  }
}
