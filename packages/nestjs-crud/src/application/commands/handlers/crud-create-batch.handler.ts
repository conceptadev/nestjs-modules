import { HttpException, PlainLiteralObject } from '@nestjs/common';

import { CrudQueryException } from '../../../infrastructure/exceptions/crud-query.exception';
import { CrudCreateBatchCommand } from '../impl/crud-create-batch.command';

import { CrudWithBodyCommandHandler } from './crud-with-body-command.handler';

export class CrudCreateBatchHandler<
  Entity extends PlainLiteralObject = PlainLiteralObject,
  DTO extends Entity = Entity,
> extends CrudWithBodyCommandHandler<Entity> {
  async execute(
    command: CrudCreateBatchCommand<Entity, DTO>,
  ): Promise<Entity[]> {
    const { context, dto } = command;

    try {
      return await this.crudAdapter.createBatch(context, dto);
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
