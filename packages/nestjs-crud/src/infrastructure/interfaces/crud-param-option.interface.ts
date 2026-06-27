import { type PlainLiteralObject } from '@nestjs/common';
import { type SwaggerEnumType } from '@nestjs/swagger/dist/types/swagger-enum.type';

import { type EntityColumn } from '@concepta/nestjs-repository';

export interface CrudParamOptionInterface<T extends PlainLiteralObject> {
  field?: EntityColumn<T>;
  type?: 'number' | 'string' | 'uuid';
  enum?: SwaggerEnumType;
  primary?: boolean;
  disabled?: boolean;
}
