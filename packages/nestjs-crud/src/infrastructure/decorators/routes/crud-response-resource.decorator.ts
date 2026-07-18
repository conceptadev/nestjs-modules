import { type Type } from '@nestjs/common';

import { CRUD_MODULE_RESPONSE_RESOURCE_METADATA } from '../../../crud.constants.js';
import {
  CrudMetadataLookupTarget,
  CrudMetadata,
} from '../../services/crud-metadata.service.js';

/**
 * Set the response DTO type for single-item responses.
 *
 * Can be applied at controller level (default) or method level (override).
 */
export const CrudResponseResource = CrudMetadata.createDecorator<Type>({
  key: CRUD_MODULE_RESPONSE_RESOURCE_METADATA,
  lookupTarget: CrudMetadataLookupTarget.MethodAndClass,
});
