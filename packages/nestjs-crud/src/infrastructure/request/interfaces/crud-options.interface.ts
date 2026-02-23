import { PlainLiteralObject, ValidationPipeOptions } from '@nestjs/common';

import { CrudParamsOptionsInterface } from '../../interfaces/crud-params-options.interface';

import { CrudQueryOptionsInterface } from './crud-query-options.interface';

export interface CrudOptionsInterface<T extends PlainLiteralObject> {
  query?: CrudQueryOptionsInterface<T>;
  params?: CrudParamsOptionsInterface<T>;
  validation?: ValidationPipeOptions | false;
}
