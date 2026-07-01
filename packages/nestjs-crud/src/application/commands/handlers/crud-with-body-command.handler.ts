import { type PlainLiteralObject } from '@nestjs/common';

import { type DeepPartial } from '@concepta/nestjs-core';

import { type CrudAdapter } from '../../../infrastructure/adapters/crud.adapter';
import { type CrudWithBodyCommand } from '../impl/crud-with-body.command';

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
