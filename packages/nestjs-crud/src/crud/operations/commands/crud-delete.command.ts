import { PlainLiteralObject } from '@nestjs/common';

import { CrudCommandInterface } from '../../interfaces/crud-command.interface';
import { CrudContextInterface } from '../../interfaces/crud-context.interface';

export class CrudDeleteCommand<Entity extends PlainLiteralObject>
  implements CrudCommandInterface<Entity>
{
  constructor(public readonly context: CrudContextInterface<Entity>) {}
}
