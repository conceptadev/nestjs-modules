import { HttpException, PlainLiteralObject } from '@nestjs/common';

import { CrudQueryException } from '../../../infrastructure/exceptions/crud-query.exception';
import { CrudDeleteCommand } from '../impl/crud-delete.command';

import { CrudCommandHandler } from './crud-command.handler';

export class CrudDeleteHandler<
  Entity extends PlainLiteralObject = PlainLiteralObject,
> extends CrudCommandHandler<Entity> {
  async execute(command: CrudDeleteCommand<Entity>): Promise<Entity | null> {
    const { context } = command;

    try {
      return await this.crudAdapter.delete(context);
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
