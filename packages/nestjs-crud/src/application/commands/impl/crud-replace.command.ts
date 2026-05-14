import { PlainLiteralObject } from '@nestjs/common';

import { DeepPartial } from '@concepta/rockets-app';

import { CrudContextInterface } from '../../../infrastructure/interceptors/interfaces/crud-context.interface';

import { CrudWithBodyCommand } from './crud-with-body.command';

export class CrudReplaceCommand<
  Entity extends PlainLiteralObject,
  Replaceable extends DeepPartial<Entity> = DeepPartial<Entity>,
> extends CrudWithBodyCommand<Entity, Replaceable> {
  constructor(
    public readonly context: CrudContextInterface<Entity>,
    public readonly dto: Replaceable,
  ) {
    super(context, dto);
  }
}
