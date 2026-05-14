import { PlainLiteralObject } from '@nestjs/common';

import { DeepPartial } from '@concepta/rockets-app';

import { CrudAdapter } from '../../../infrastructure/adapters/crud.adapter';
import { CrudWithBodyCommand } from '../impl/crud-with-body.command';

import { CrudCommandHandler } from './crud-command.handler';

export class CrudWithBodyCommandHandler<
  Entity extends PlainLiteralObject = PlainLiteralObject,
  DTO extends DeepPartial<Entity> = DeepPartial<Entity>,
> extends CrudCommandHandler<Entity> {
  constructor(readonly crudAdapter: CrudAdapter<Entity>) {
    super(crudAdapter);
  }

  execute(
    _command: CrudWithBodyCommand<Entity, DTO>,
  ): Promise<Entity | Entity[]> {
    throw new Error('Method not implemented');
  }
}
