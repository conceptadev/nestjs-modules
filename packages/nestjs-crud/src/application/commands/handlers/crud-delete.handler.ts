import { HttpException, type PlainLiteralObject } from '@nestjs/common';

import { CrudQueryException } from '../../../infrastructure/exceptions/crud-query.exception.js';
import { type CrudDeleteCommand } from '../impl/crud-delete.command.js';

import { CrudCommandHandler } from './crud-command.handler.js';

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
