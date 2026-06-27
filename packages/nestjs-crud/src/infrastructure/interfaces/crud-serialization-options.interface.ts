import { type ClassTransformOptions } from 'class-transformer';

import { type Type } from '@nestjs/common';

export interface CrudSerializationOptionsInterface {
  type?: Type;
  paginatedType?: Type;
  toInstanceOptions?: ClassTransformOptions;
  toPlainOptions?: ClassTransformOptions;
}
