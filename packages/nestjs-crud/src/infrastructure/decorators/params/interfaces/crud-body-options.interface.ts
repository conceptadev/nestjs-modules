import { type Body, type PlainLiteralObject } from '@nestjs/common';

import { type CrudValidationOptions } from '../../../../crud.types';

export interface CrudBodyOptionsInterface<
  T extends PlainLiteralObject = PlainLiteralObject,
> {
  validation?: CrudValidationOptions<T>;
  pipes?: Parameters<typeof Body>[1][];
}
