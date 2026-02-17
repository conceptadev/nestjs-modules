import { PlainLiteralObject } from '@nestjs/common';

import { CRUD_MODULE_CONTROLLER_ADAPTER_METADATA } from '../../../crud.constants';
import {
  CrudMetadataLookupTarget,
  CrudMetadata,
} from '../../../services/crud-metadata.service';
import { CrudAdapterProvider } from '../../interfaces/crud-adapter-provider.interface';

/**
 * Set the adapter type used for the controller.
 *
 * Applied at controller level.
 */
export const CrudAdapter = CrudMetadata.createWrappedDecorator(
  {
    key: CRUD_MODULE_CONTROLLER_ADAPTER_METADATA,
    lookupTarget: CrudMetadataLookupTarget.Class,
  },
  (decorator) =>
    <Entity extends PlainLiteralObject = PlainLiteralObject>(
      adapter?: CrudAdapterProvider<Entity>,
    ) =>
      decorator(adapter),
);
