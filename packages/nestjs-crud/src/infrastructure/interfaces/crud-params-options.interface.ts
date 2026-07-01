import { type PlainLiteralObject } from '@nestjs/common';

import { type CrudParamOptionInterface } from './crud-param-option.interface';

export interface CrudParamsOptionsInterface<T extends PlainLiteralObject> {
  [key: string]: CrudParamOptionInterface<T>;
}
