import { CRUD_MODULE_ROUTE_SERIALIZATION_METADATA } from '../../../crud.constants';
import { CrudSerializationOptionsInterface } from '../../interfaces/crud-serialization-options.interface';
import {
  CrudMetadataLookupTarget,
  CrudMetadata,
} from '../../services/crud-metadata.service';

/**
 * CRUD serialize route decorator
 */
export const CrudSerialize =
  CrudMetadata.createDecorator<CrudSerializationOptionsInterface>({
    key: CRUD_MODULE_ROUTE_SERIALIZATION_METADATA,
    lookupTarget: CrudMetadataLookupTarget.MethodAndClass,
  });
