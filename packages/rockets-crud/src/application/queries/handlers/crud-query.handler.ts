import { PlainLiteralObject } from '@nestjs/common';

import { CrudAdapter } from '../../../infrastructure/adapters/crud.adapter';
import { CrudResponsePaginatedInterface } from '../../../infrastructure/dtos/interfaces/crud-response-paginated.interface';
import { CrudQueryException } from '../../../infrastructure/exceptions/crud-query.exception';
import { CrudQueryHandlerInterface } from '../interfaces/crud-query-handler.interface';
import { CrudQueryInterface } from '../interfaces/crud-query.interface';

/**
 * Base class for CRUD query handlers.
 *
 * This class does NOT implement IQueryHandler directly. The resolver
 * applies the `@QueryHandler` decorator if CQRS is being used.
 */
export class CrudQueryHandler<
  Entity extends PlainLiteralObject = PlainLiteralObject,
> implements CrudQueryHandlerInterface<Entity>
{
  constructor(readonly crudAdapter: CrudAdapter<Entity>) {}

  execute(
    _query: CrudQueryInterface<Entity>,
  ): Promise<Entity | CrudResponsePaginatedInterface<Entity>> {
    throw new CrudQueryException(this.crudAdapter.entityName(), {
      message: 'Subclass must implement execute()',
    });
  }
}
