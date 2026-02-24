import { HttpException, PlainLiteralObject } from '@nestjs/common';

import { CrudQueryException } from '../../../infrastructure/exceptions/crud-query.exception';
import { CrudSoftDeleteCommand } from '../impl/crud-soft-delete.command';

import { CrudCommandHandler } from './crud-command.handler';

export class CrudSoftDeleteHandler<
  Entity extends PlainLiteralObject = PlainLiteralObject,
> extends CrudCommandHandler<Entity> {
  async execute(
    command: CrudSoftDeleteCommand<Entity>,
  ): Promise<Entity | null> {
    const { context } = command;

    try {
      return await this.crudAdapter.softDelete(context);
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
