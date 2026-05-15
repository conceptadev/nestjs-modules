import { PlainLiteralObject } from '@nestjs/common';
import { SwaggerEnumType } from '@nestjs/swagger/dist/types/swagger-enum.type';

import { EntityColumn } from '@concepta/rockets-repository';

export interface CrudParamOptionInterface<T extends PlainLiteralObject> {
  field?: EntityColumn<T>;
  type?: 'number' | 'string' | 'uuid';
  enum?: SwaggerEnumType;
  primary?: boolean;
  disabled?: boolean;
}
