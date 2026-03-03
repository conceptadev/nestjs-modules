import { RelationAction } from '../repository.types';

/**
 * ORM-agnostic relation metadata for repository introspection.
 *
 * Based on the Tier 3 ORM common denominator — available in
 * TypeORM, MikroORM, Sequelize, Prisma, Objection, Drizzle Relational.
 *
 * Mirrors `JoinClause.on` and `JoinClause.through` for trivial mapping.
 * `on.from` is always "my column", `on.to` is always "their column".
 */
export interface RepositoryRelationMetadataInterface {
  /** Relation property name on the entity (e.g., 'blog', 'posts') */
  name: string;
  /** Target entity name (e.g., 'BlogEntity') */
  targetEntity: string;
  /** 'one' for 1:1/N:1, 'many' for 1:N/M:N */
  cardinality: 'one' | 'many';
  /** Column mapping: from = source entity column, to = target entity column */
  on: { from: string; to: string };
  /** M:N junction info (mirrors JoinClause.through) */
  through?: {
    /** Junction entity or table name. */
    relation: string;
    /** Junction FK column pointing to the source entity. */
    fromKey: string;
    /** Junction FK column pointing to the target entity. */
    toKey: string;
  };
  /** Action to take on related records when the source entity is deleted. */
  onDelete?: RelationAction;
  /** Action to take on related records when the source entity's PK is updated. */
  onUpdate?: RelationAction;
}
