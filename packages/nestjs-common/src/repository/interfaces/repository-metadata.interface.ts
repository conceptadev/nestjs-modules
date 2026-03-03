import { PlainLiteralObject, Type } from '@nestjs/common';

import { RepositoryColumnMetadataInterface } from './repository-column-metadata.interface';
import { RepositoryRelationMetadataInterface } from './repository-relation-metadata.interface';

/**
 * Repository metadata interface for entity introspection.
 * Provides schema information without exposing ORM internals.
 */
export interface RepositoryMetadataInterface<
  Entity extends PlainLiteralObject,
> {
  /** Entity name (class name) */
  name: string;
  /** Entity class/constructor */
  type: Type<Entity>;
  /** All columns in the entity */
  columns: RepositoryColumnMetadataInterface<Entity>[];
  /** Relation metadata for join resolution */
  relations?: RepositoryRelationMetadataInterface[];
}
