import { HttpException, PlainLiteralObject } from '@nestjs/common';

import { CrudResponsePaginatedInterface } from '../../../infrastructure/dtos/interfaces/crud-response-paginated.interface';
import { CrudQueryException } from '../../../infrastructure/exceptions/crud-query.exception';
import { CrudListQuery } from '../impl/crud-list.query';

import { CrudQueryHandler } from './crud-query.handler';

export class CrudListHandler<
  Entity extends PlainLiteralObject = PlainLiteralObject,
  Relations extends PlainLiteralObject[] = PlainLiteralObject[],
> extends CrudQueryHandler<Entity, Relations> {
  async execute(
    query: CrudListQuery<Entity>,
  ): Promise<CrudResponsePaginatedInterface<Entity>> {
    const { context } = query;

    try {
      if (this.hasRelations(context)) {
        if (!this.federationService) {
          throw new Error('Federation service required for relation queries');
        }
        return await this.federationService.list(context);
      } else {
        return await this.crudAdapter.list(context);
      }
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
