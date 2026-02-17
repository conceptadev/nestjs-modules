import { HttpException, PlainLiteralObject } from '@nestjs/common';

import { CrudQueryException } from '../../../exceptions/crud-query.exception';
import { CrudReadQuery } from '../queries/crud-read.query';

import { CrudQueryHandler } from './crud-query.handler';

export class CrudReadHandler<
  Entity extends PlainLiteralObject = PlainLiteralObject,
  Relations extends PlainLiteralObject[] = PlainLiteralObject[],
> extends CrudQueryHandler<Entity, Relations> {
  async execute(query: CrudReadQuery<Entity>): Promise<Entity> {
    const { context } = query;

    try {
      if (this.hasRelations(context)) {
        if (!this.federationService) {
          throw new Error('Federation service required for relation queries');
        }
        return await this.federationService.read(context);
      } else {
        return await this.crudAdapter.read(context);
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
