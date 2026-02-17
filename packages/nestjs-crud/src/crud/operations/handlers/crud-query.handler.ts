import { PlainLiteralObject } from '@nestjs/common';

import { CrudFederationService } from '../../../services/crud-federation.service';
import { CrudAdapter } from '../../adapters/crud.adapter';
import { CrudContextInterface } from '../../interfaces/crud-context.interface';
import { CrudQueryHandlerInterface } from '../../interfaces/crud-query-handler.interface';
import { CrudQueryInterface } from '../../interfaces/crud-query.interface';
import { CrudResponsePaginatedInterface } from '../../interfaces/crud-response-paginated.interface';

/**
 * Base class for CRUD query handlers.
 *
 * This class does NOT implement IQueryHandler directly. The resolver
 * applies the `@QueryHandler` decorator if CQRS is being used.
 */
export class CrudQueryHandler<
  Entity extends PlainLiteralObject = PlainLiteralObject,
  Relations extends PlainLiteralObject[] = PlainLiteralObject[],
> implements CrudQueryHandlerInterface<Entity>
{
  constructor(
    readonly crudAdapter: CrudAdapter<Entity>,
    protected readonly federationService?: CrudFederationService<
      Entity,
      Relations
    >,
  ) {}

  hasRelations(context: CrudContextInterface<Entity>): boolean {
    const relations = context.options?.query?.relations?.relations ?? [];
    return relations.length > 0;
  }

  execute(
    _query: CrudQueryInterface<Entity>,
  ): Promise<Entity | CrudResponsePaginatedInterface<Entity>> {
    throw new Error('Method not implemented');
  }
}
