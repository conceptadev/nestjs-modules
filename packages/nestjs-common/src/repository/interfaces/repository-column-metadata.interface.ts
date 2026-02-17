import { PlainLiteralObject, Type } from '@nestjs/common';

/**
 * Column metadata for repository introspection.
 */
export interface RepositoryColumnMetadataInterface<
  Entity extends PlainLiteralObject = PlainLiteralObject,
> {
  /** Property name on the entity class */
  name: keyof Entity & string;
  /** Whether this is a primary key column */
  isPrimary: boolean;
  /** Whether this column is the soft-remove date column */
  isRemoveDate: boolean;
}

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
}
