import { HttpStatus } from '@nestjs/common';

import { RuntimeExceptionOptions } from '@concepta/rockets-app';

import { CrudException } from '../../exceptions/crud.exception';

export class CrudQueryValidatorException extends CrudException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      httpStatus: HttpStatus.BAD_REQUEST,
      ...options,
    });
    this.errorCode = 'CRUD_QUERY_VALIDATOR_ERROR';
  }
}
