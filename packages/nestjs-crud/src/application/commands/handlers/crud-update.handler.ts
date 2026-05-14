import { HttpException, PlainLiteralObject } from '@nestjs/common';

import { DeepPartial } from '@concepta/rockets-app';

import { CrudQueryException } from '../../../infrastructure/exceptions/crud-query.exception';
import { CrudUpdateCommand } from '../impl/crud-update.command';

import { CrudWithBodyCommandHandler } from './crud-with-body-command.handler';

export class CrudUpdateHandler<
  Entity extends PlainLiteralObject = PlainLiteralObject,
  DTO extends DeepPartial<Entity> = DeepPartial<Entity>,
> extends CrudWithBodyCommandHandler<Entity, DTO> {
  async execute(command: CrudUpdateCommand<Entity, DTO>): Promise<Entity> {
    const { context, dto } = command;

    try {
      return await this.crudAdapter.update(context, dto);
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      }
      throw new CrudQueryException(this.crudAdapter.entityName(), {
        originalError: e,
      });
    }
  }
}
