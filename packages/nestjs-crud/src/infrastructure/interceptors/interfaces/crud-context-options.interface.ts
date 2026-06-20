import { PlainLiteralObject } from '@nestjs/common';

import { CrudParamsOptionsInterface } from '../../interfaces/crud-params-options.interface';
import { CrudQueryOptionsInterface } from '../../request/interfaces/crud-query-options.interface';

import { CrudRouteOptionsInterface } from './crud-route-options.interface';

export interface CrudContextOptionsInterface<T extends PlainLiteralObject> {
  query?: CrudQueryOptionsInterface<T>;
  route?: CrudRouteOptionsInterface<T>;
  params?: CrudParamsOptionsInterface<T>;
}
