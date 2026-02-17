import { PlainLiteralObject } from '@nestjs/common';

import { CRUD_MODULE_ROUTE_QUERY_CACHE_METADATA } from '../../../crud.constants';
import {
  CrudMetadataLookupTarget,
  CrudMetadata,
} from '../../../services/crud-metadata.service';
import { CrudQueryOptionsInterface } from '../../interfaces/crud-query-options.interface';

/**
 * CRUD cache route decorator.
 *
 * Set the CRUD cache query option. Relies on repository adapter support
 * for caching (e.g., TypeORM query caching).
 */
export const CrudCache = CrudMetadata.createWrappedDecorator(
  {
    key: CRUD_MODULE_ROUTE_QUERY_CACHE_METADATA,
    lookupTarget: CrudMetadataLookupTarget.MethodAndClass,
  },
  (decorator) =>
    <Entity extends PlainLiteralObject = PlainLiteralObject>(
      cache: CrudQueryOptionsInterface<Entity>['cache'],
    ) =>
      decorator(cache),
);
