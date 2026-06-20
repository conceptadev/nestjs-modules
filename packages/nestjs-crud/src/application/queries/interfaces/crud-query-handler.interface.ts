import { PlainLiteralObject } from '@nestjs/common';

import { CrudAdapter } from '../../../infrastructure/adapters/crud.adapter';
import { CrudResponsePaginatedInterface } from '../../../infrastructure/dtos/interfaces/crud-response-paginated.interface';

import { CrudQueryInterface } from './crud-query.interface';

/**
 * The CRUD query handler interface.
 *
 * This interface defines the contract for query handlers without
 * coupling to `@nestjs/cqrs`. The resolver applies CQRS decorators
 * if needed at decoration-time.
 */
export interface CrudQueryHandlerInterface<
  Entity extends PlainLiteralObject = PlainLiteralObject,
  _Relations extends PlainLiteralObject[] = PlainLiteralObject[],
> {
  crudAdapter: CrudAdapter<Entity>;

  execute(
    query: CrudQueryInterface<Entity>,
  ): Promise<Entity | CrudResponsePaginatedInterface<Entity>>;
}
