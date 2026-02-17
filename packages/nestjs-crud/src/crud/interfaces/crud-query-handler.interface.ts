import { PlainLiteralObject } from '@nestjs/common';

import { CrudAdapter } from '../adapters/crud.adapter';

import { CrudContextInterface } from './crud-context.interface';
import { CrudQueryInterface } from './crud-query.interface';
import { CrudResponsePaginatedInterface } from './crud-response-paginated.interface';

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

  hasRelations(context: CrudContextInterface<Entity>): boolean;

  execute(
    query: CrudQueryInterface<Entity>,
  ): Promise<Entity | CrudResponsePaginatedInterface<Entity>>;
}
