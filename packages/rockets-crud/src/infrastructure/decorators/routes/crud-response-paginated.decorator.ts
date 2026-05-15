import { Type } from '@nestjs/common';

import { CRUD_MODULE_RESPONSE_PAGINATED_METADATA } from '../../../crud.constants';
import {
  CrudMetadataLookupTarget,
  CrudMetadata,
} from '../../services/crud-metadata.service';

/**
 * Set the response DTO type for paginated responses.
 *
 * Can be applied at controller level (default) or method level (override).
 */
export const CrudResponsePaginated = CrudMetadata.createDecorator<Type>({
  key: CRUD_MODULE_RESPONSE_PAGINATED_METADATA,
  lookupTarget: CrudMetadataLookupTarget.MethodAndClass,
});
