import { PlainLiteralObject } from '@nestjs/common';

import { CRUD_MODULE_ROUTE_QUERY_MAX_LIMIT_METADATA } from '../../../crud.constants';
import { CrudQueryOptionsInterface } from '../../request/interfaces/crud-query-options.interface';
import {
  CrudMetadataLookupTarget,
  CrudMetadata,
} from '../../services/crud-metadata.service';

/**
 * CRUD max limit route decorator.
 *
 * Set the CRUD max limit query option.
 */
export const CrudMaxLimit = CrudMetadata.createWrappedDecorator(
  {
    key: CRUD_MODULE_ROUTE_QUERY_MAX_LIMIT_METADATA,
    lookupTarget: CrudMetadataLookupTarget.MethodAndClass,
  },
  (decorator) =>
    <Entity extends PlainLiteralObject = PlainLiteralObject>(
      maxLimit: CrudQueryOptionsInterface<Entity>['maxLimit'],
    ) =>
      decorator(maxLimit),
);
