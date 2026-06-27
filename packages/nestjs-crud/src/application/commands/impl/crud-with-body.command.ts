import { type PlainLiteralObject } from '@nestjs/common';

import { type DeepPartial } from '@concepta/nestjs-core';

import { type CrudCreateBatchInterface } from '../../../infrastructure/dtos/interfaces/crud-create-batch.interface';
import { type CrudContextInterface } from '../../../infrastructure/interceptors/interfaces/crud-context.interface';
import { type CrudCommandInterface } from '../interfaces/crud-command.interface';

export class CrudWithBodyCommand<
  Entity extends PlainLiteralObject,
  DTO extends DeepPartial<Entity> = DeepPartial<Entity>,
> implements CrudCommandInterface<Entity> {
  constructor(
    public readonly context: CrudContextInterface<Entity>,
    public readonly dto: DTO | CrudCreateBatchInterface<DTO>,
  ) {}
}
