import { Operation } from '@concepta/rockets-app';

import { CRUD_MODULE_ROUTE_OPERATION_METADATA } from '../../../crud.constants';
import {
  CrudMetadataLookupTarget,
  CrudMetadata,
} from '../../services/crud-metadata.service';

/**
 * CRUD operation route decorator.
 */
export const CrudOperation = CrudMetadata.createDecorator<Operation>({
  key: CRUD_MODULE_ROUTE_OPERATION_METADATA,
  lookupTarget: CrudMetadataLookupTarget.Method,
});
