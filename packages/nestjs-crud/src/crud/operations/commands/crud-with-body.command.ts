import { PlainLiteralObject } from '@nestjs/common';

import { DeepPartial } from '@concepta/nestjs-common';

import { CrudCommandInterface } from '../../interfaces/crud-command.interface';
import { CrudContextInterface } from '../../interfaces/crud-context.interface';
import { CrudCreateBatchInterface } from '../../interfaces/crud-create-batch.interface';

export class CrudWithBodyCommand<
  Entity extends PlainLiteralObject,
  DTO extends DeepPartial<Entity> = DeepPartial<Entity>,
> implements CrudCommandInterface<Entity>
{
  constructor(
    public readonly context: CrudContextInterface<Entity>,
    public readonly dto: DTO | CrudCreateBatchInterface<DTO>,
  ) {}
}
