import { PlainLiteralObject } from '@nestjs/common';

import { CRUD_MODULE_ROUTE_RELATIONS_METADATA } from '../../../crud.constants';
import {
  CrudMetadataLookupTarget,
  CrudMetadata,
} from '../../../services/crud-metadata.service';
import { CrudRelationsInterface } from '../../interfaces/crud-relations.interface';

/**
 * CRUD Relations route decorator.
 *
 * Configure relationship properties for hydrating sub-properties based on raw
 * foreign keys.
 */
export const CrudRelations = CrudMetadata.createWrappedDecorator(
  {
    key: CRUD_MODULE_ROUTE_RELATIONS_METADATA,
    lookupTarget: CrudMetadataLookupTarget.MethodAndClass,
  },
  (decorator) =>
    <
      Entity extends PlainLiteralObject = PlainLiteralObject,
      Relations extends PlainLiteralObject[] = PlainLiteralObject[],
    >(
      relations: CrudRelationsInterface<Entity, Relations>,
    ) =>
      decorator(relations),
);
