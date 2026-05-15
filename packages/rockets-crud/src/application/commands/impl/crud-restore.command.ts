import { PlainLiteralObject } from '@nestjs/common';

import { CrudContextInterface } from '../../../infrastructure/interceptors/interfaces/crud-context.interface';
import { CrudCommandInterface } from '../interfaces/crud-command.interface';

export class CrudRestoreCommand<Entity extends PlainLiteralObject>
  implements CrudCommandInterface<Entity>
{
  constructor(public readonly context: CrudContextInterface<Entity>) {}
}
