import { Type } from '@nestjs/common';

import { CRUD_MODULE_REQUEST_BODY_BATCH_METADATA } from '../../../crud.constants';
import {
  CrudMetadataLookupTarget,
  CrudMetadata,
} from '../../services/crud-metadata.service';

/**
 * Set the expected body DTO type for batch mutations (createBatch).
 *
 * Can be applied at controller level (default) or method level (override).
 */
export const CrudRequestBodyBatch = CrudMetadata.createDecorator<Type>({
  key: CRUD_MODULE_REQUEST_BODY_BATCH_METADATA,
  lookupTarget: CrudMetadataLookupTarget.MethodAndClass,
});
