import { HttpException, PlainLiteralObject } from '@nestjs/common';

import { DeepPartial } from '@concepta/nestjs-common';

import { CrudQueryException } from '../../../domain/exceptions/crud-query.exception';
import { CrudReplaceCommand } from '../impl/crud-replace.command';

import { CrudWithBodyCommandHandler } from './crud-with-body-command.handler';

export class CrudReplaceHandler<
  Entity extends PlainLiteralObject = PlainLiteralObject,
  DTO extends DeepPartial<Entity> = DeepPartial<Entity>,
> extends CrudWithBodyCommandHandler<Entity, DTO> {
  async execute(command: CrudReplaceCommand<Entity, DTO>): Promise<Entity> {
    const { context, dto } = command;

    try {
      return await this.crudAdapter.replace(context, dto);
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
