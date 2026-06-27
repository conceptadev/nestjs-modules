import { type PlainLiteralObject } from '@nestjs/common';

import { type CrudContextInterface } from '../../../infrastructure/interceptors/interfaces/crud-context.interface';
import { type CrudQueryInterface } from '../interfaces/crud-query.interface';

export class CrudListQuery<
  Entity extends PlainLiteralObject,
> implements CrudQueryInterface<Entity> {
  constructor(public readonly context: CrudContextInterface<Entity>) {}
}
