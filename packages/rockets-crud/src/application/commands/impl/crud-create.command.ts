import { PlainLiteralObject } from '@nestjs/common';

import { DeepPartial } from '@concepta/rockets-app';

import { CrudContextInterface } from '../../../infrastructure/interceptors/interfaces/crud-context.interface';

import { CrudWithBodyCommand } from './crud-with-body.command';

export class CrudCreateCommand<
  Entity extends PlainLiteralObject,
  Creatable extends DeepPartial<Entity> = DeepPartial<Entity>,
> extends CrudWithBodyCommand<Entity, Creatable> {
  constructor(
    public readonly context: CrudContextInterface<Entity>,
    public readonly dto: Creatable,
  ) {
    super(context, dto);
  }
}
