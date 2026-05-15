import { HttpStatus } from '@nestjs/common';

import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/rockets-app';

export class CrudQueryParserException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      httpStatus: HttpStatus.BAD_REQUEST,
      ...options,
    });
    this.errorCode = 'CRUD_QUERY_PARSER_ERROR';
  }
}
