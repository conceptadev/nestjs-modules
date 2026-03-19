import { PlainLiteralObject, Type } from '@nestjs/common';

export interface RepositoryEntityOptionInterface<
  T extends PlainLiteralObject = PlainLiteralObject,
> {
  entity: Type<T>;
}
