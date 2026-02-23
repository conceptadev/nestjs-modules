import { PlainLiteralObject } from '@nestjs/common';

import { CrudContextInterface } from '../../../infrastructure/interceptors/interfaces/crud-context.interface';
import { CrudQueryInterface } from '../interfaces/crud-query.interface';

export class CrudReadQuery<Entity extends PlainLiteralObject>
  implements CrudQueryInterface<Entity>
{
  constructor(public readonly context: CrudContextInterface<Entity>) {}
}
