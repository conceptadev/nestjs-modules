import { HttpException, type PlainLiteralObject } from '@nestjs/common';

import { CrudQueryException } from '../../../infrastructure/exceptions/crud-query.exception.js';
import { type CrudRestoreCommand } from '../impl/crud-restore.command.js';

import { CrudCommandHandler } from './crud-command.handler.js';

export class CrudRestoreHandler<
  Entity extends PlainLiteralObject = PlainLiteralObject,
> extends CrudCommandHandler<Entity> {
  async execute(command: CrudRestoreCommand<Entity>): Promise<Entity | null> {
    const { context } = command;

    try {
      return await this.crudAdapter.restore(context);
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
