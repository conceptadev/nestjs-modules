import {
  type PlainLiteralObject,
  type ValidationPipeOptions,
} from '@nestjs/common';

import { type CrudParamsOptionsInterface } from '../../interfaces/crud-params-options.interface';

import { type CrudQueryOptionsInterface } from './crud-query-options.interface';

export interface CrudOptionsInterface<T extends PlainLiteralObject> {
  query?: CrudQueryOptionsInterface<T>;
  params?: CrudParamsOptionsInterface<T>;
  validation?: ValidationPipeOptions | false;
}
