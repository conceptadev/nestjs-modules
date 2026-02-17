import { HttpException, PlainLiteralObject } from '@nestjs/common';

import { CrudQueryException } from '../../../exceptions/crud-query.exception';
import { CrudRestoreCommand } from '../commands/crud-restore.command';

import { CrudCommandHandler } from './crud-command.handler';

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
