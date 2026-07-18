import { HttpException, type PlainLiteralObject } from '@nestjs/common';

import { type CrudResponsePaginatedInterface } from '../../../infrastructure/dtos/interfaces/crud-response-paginated.interface.js';
import { CrudQueryException } from '../../../infrastructure/exceptions/crud-query.exception.js';
import { type CrudListQuery } from '../impl/crud-list.query.js';

import { CrudQueryHandler } from './crud-query.handler.js';

export class CrudListHandler<
  Entity extends PlainLiteralObject = PlainLiteralObject,
> extends CrudQueryHandler<Entity> {
  async execute(
    query: CrudListQuery<Entity>,
  ): Promise<CrudResponsePaginatedInterface<Entity>> {
    const { context } = query;

    try {
      return await this.crudAdapter.list(context);
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
