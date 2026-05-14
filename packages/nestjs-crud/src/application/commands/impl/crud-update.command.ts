import { PlainLiteralObject } from '@nestjs/common';

import { DeepPartial } from '@concepta/rockets-app';

import { CrudContextInterface } from '../../../infrastructure/interceptors/interfaces/crud-context.interface';

import { CrudWithBodyCommand } from './crud-with-body.command';

export class CrudUpdateCommand<
  Entity extends PlainLiteralObject,
  Updatable extends DeepPartial<Entity> = DeepPartial<Entity>,
> extends CrudWithBodyCommand<Entity, Updatable> {
  constructor(
    public readonly context: CrudContextInterface<Entity>,
    public readonly dto: Updatable,
  ) {
    super(context, dto);
  }
}
