import {
  type PipeTransform,
  type PlainLiteralObject,
  type Type,
} from '@nestjs/common';

import { type CrudValidationOptions } from '../../../../crud.types';

export interface CrudBodyOptionsInterface<
  T extends PlainLiteralObject = PlainLiteralObject,
> {
  validation?: CrudValidationOptions<T>;
  pipes?: (Type<PipeTransform> | PipeTransform)[];
}
