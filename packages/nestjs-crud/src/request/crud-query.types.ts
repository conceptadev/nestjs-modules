import { PlainLiteralObject } from '@nestjs/common';

import { EntityColumn, WhereCondition } from '@concepta/nestjs-common';

import { CrudQueryOptionsInterface } from '../crud/interfaces/crud-query-options.interface';

/**
 * Wire format prefix for comparison operators in query strings.
 */
export const COND_OPERATOR_PREFIX = '$';

export enum CondOperator {
  EQUALS = '$eq',
  NOT_EQUALS = '$ne',
  GREATER_THAN = '$gt',
  LOWER_THAN = '$lt',
  GREATER_THAN_EQUALS = '$gte',
  LOWER_THAN_EQUALS = '$lte',
  STARTS = '$starts',
  NOT_STARTS = '$nstarts',
  ENDS = '$ends',
  NOT_ENDS = '$nends',
  CONTAINS = '$contains',
  NOT_CONTAINS = '$ncontains',
  IN = '$in',
  NOT_IN = '$nin',
  IS_NULL = '$null',
  NOT_NULL = '$nnull',
  BETWEEN = '$between',
}

export type ComparisonOperator = `${CondOperator}`;

// new search
export type SPrimitivesVal = string | number | boolean;

export type SFieldValues = SPrimitivesVal | Array<SPrimitivesVal>;

export type SFieldOperator = {
  [K in CondOperator]?: SFieldValues;
} & {
  $or?: SFieldOperator;
  $and?: never;
};

export type SField = SPrimitivesVal | SFieldOperator;

export type SFields<T extends PlainLiteralObject> = Partial<
  Record<
    EntityColumn<T>,
    SField | Array<SFields<T> | SConditionAND<T>> | undefined | null
  >
> & {
  $or?: Array<SCondition<T>>;
  $and?: never;
};

export type SConditionAND<T extends PlainLiteralObject> = {
  [key: string]: unknown;
  $and?: Array<SCondition<T>>;
  $or?: never;
};

export type SConditionKey = '$and' | '$or';

export type SCondition<T extends PlainLiteralObject> =
  | SFields<T>
  | SConditionAND<T>;

export type QueryRelationCardinality = 'one' | 'many';

export type QueryJoinType = 'LEFT' | 'INNER';

type QueryRelationBase<
  Entity extends PlainLiteralObject,
  Relation extends PlainLiteralObject = PlainLiteralObject,
> = {
  /**
   * The type of relation multiplicity from root to relation entity.
   * - 'one': Root has at most one related entity (1:1 or N:1)
   * - 'many': Root can have multiple related entities (1:N)
   */
  cardinality: QueryRelationCardinality;
  /**
   * The type of join to use when fetching this relation.
   * - 'LEFT': Include all roots, even without matching relations (default)
   * - 'INNER': Only include roots with matching relations
   */
  join?: QueryJoinType;
  /**
   * The entity name for the relation. Used by the resolver to find the
   * correct adapter for fetching relation data.
   */
  entity: string;
  /**
   * The property name in the root (anchor) entity that holds the relation.
   */
  property: EntityColumn<Entity> & string;
  /**
   * Filter to ensure uniqueness for many-cardinality relationships when sorting.
   * Required for relation sorting on 'many' relationships to guarantee at most
   * one relation row per root entity for consistent sort order.
   *
   * Example: `{ field: 'isLatest', operator: WhereOperator.EQ, value: true }`
   */
  distinctFilter?: WhereCondition<Relation>;
  /**
   *  Options for the relation.
   */
  options?: {
    query: Pick<CrudQueryOptionsInterface<Relation>, 'allow' | 'exclude'>;
  };
};

export type QueryRelation<
  Entity extends PlainLiteralObject,
  Relation extends PlainLiteralObject = PlainLiteralObject,
> = QueryRelationBase<Entity, Relation> & {
  /**
   * Whether the root entity owns the foreign key.
   * - false (default): Relation entity stores FK (relation[foreignKey] → root[primaryKey])
   * - true: Root entity stores FK (root[foreignKey] → relation[primaryKey])
   */
  owner?: boolean;
} & ( // Default ownership: relation[foreignKey] -> root[primaryKey]
    | {
        owner?: false | undefined;
        /**
         * The primary key field name in the root entity (target of the reference)
         */
        primaryKey: EntityColumn<Entity> & string;
        /**
         * The foreign key field name in the relation entity (holds the reference)
         */
        foreignKey: EntityColumn<Relation> & string;
      }
    // Root ownership: root[foreignKey] -> relation[primaryKey]
    | {
        owner: true;
        /**
         * The primary key field name in the relation entity (target of the reference)
         */
        primaryKey: EntityColumn<Relation> & string;
        /**
         * The foreign key field name in the root entity (holds the reference)
         */
        foreignKey: EntityColumn<Entity> & string;
      }
  );
