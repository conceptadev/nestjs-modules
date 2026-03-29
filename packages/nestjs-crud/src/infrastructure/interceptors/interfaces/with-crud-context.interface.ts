import { PlainLiteralObject } from '@nestjs/common';

import { CrudContextInterface } from './crud-context.interface';

export interface WithCrudContextInterface<
  T extends PlainLiteralObject = PlainLiteralObject,
> {
  withCrud(): CrudContextInterface<T>;
}
