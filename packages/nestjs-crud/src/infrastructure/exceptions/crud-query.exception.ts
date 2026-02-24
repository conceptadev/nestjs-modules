import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-common';

import { CrudException } from './crud.exception';

export class CrudQueryException extends CrudException {
  context: RuntimeException['context'] & {
    entityName: string;
  };

  constructor(entityName: string, options?: RuntimeExceptionOptions) {
    super({
      message: 'Error while trying to query the %s entity',
      messageParams: [entityName],
      ...options,
    });

    this.context = {
      ...super.context,
      entityName,
    };

    this.errorCode = 'CRUD_QUERY_ERROR';
  }
}
