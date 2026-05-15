import { HttpException, PlainLiteralObject } from '@nestjs/common';

import { CrudQueryException } from '../../../infrastructure/exceptions/crud-query.exception';
import { CrudReadQuery } from '../impl/crud-read.query';

import { CrudQueryHandler } from './crud-query.handler';

export class CrudReadHandler<
  Entity extends PlainLiteralObject = PlainLiteralObject,
> extends CrudQueryHandler<Entity> {
  async execute(query: CrudReadQuery<Entity>): Promise<Entity> {
    const { context } = query;

    try {
      return await this.crudAdapter.read(context);
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
