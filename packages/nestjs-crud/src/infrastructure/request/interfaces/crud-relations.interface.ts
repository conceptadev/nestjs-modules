import { PlainLiteralObject } from '@nestjs/common';

import { EntityColumn } from '@concepta/nestjs-common';

import { QueryRelation } from '../crud-query.types';

/**
 * Defines how a root entity relates to one or more related entities
 * for CRUD query resolution (joins, federation, sorting, filtering).
 */
export interface CrudRelationsInterface<
  Entity extends PlainLiteralObject,
  Relations extends PlainLiteralObject[],
> {
  /**
   * Primary key column on the root entity used to correlate relation results.
   */
  rootKey: EntityColumn<Entity>;
  /**
   * When true, relations are fetched via separate queries and hydrated
   * in-memory rather than through database joins. Required for
   * cross-server or cross-database relation resolution.
   */
  federated?: boolean;
  /**
   * Tuple of relation definitions, one per entry in the Relations type parameter.
   * Each entry describes the join strategy, cardinality, and key mapping
   * between the root entity and a related entity.
   */
  relations: {
    [K in keyof Relations]: QueryRelation<Entity, Relations[K]>;
  };
}
