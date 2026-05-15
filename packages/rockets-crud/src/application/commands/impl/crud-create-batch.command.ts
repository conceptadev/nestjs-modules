import { PlainLiteralObject } from '@nestjs/common';

import { DeepPartial } from '@concepta/rockets-app';

import { CrudCreateBatchInterface } from '../../../infrastructure/dtos/interfaces/crud-create-batch.interface';
import { CrudContextInterface } from '../../../infrastructure/interceptors/interfaces/crud-context.interface';
import { CrudCommandInterface } from '../interfaces/crud-command.interface';

export class CrudCreateBatchCommand<
  Entity extends PlainLiteralObject,
  Creatable extends DeepPartial<Entity> = DeepPartial<Entity>,
> implements CrudCommandInterface<Entity>
{
  constructor(
    public readonly context: CrudContextInterface<Entity>,
    public readonly dto: CrudCreateBatchInterface<Creatable>,
  ) {}
}
