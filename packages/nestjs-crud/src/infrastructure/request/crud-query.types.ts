import { PlainLiteralObject } from '@nestjs/common';

import { EntityColumn, Where, WhereCondition } from '@concepta/nestjs-common';

import { CrudQueryOptionsInterface } from './interfaces/crud-query-options.interface';

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

/**
 * Shared factory map from $-prefixed wire operators to WhereCondition builders.
 *
 * Used by both CrudQueryParser (URL query string parsing) and
 * SConditionConverter (JSON search parsing). Callers handle their
 * own input validation before invoking these factories.
 */
export const COND_OPERATOR_FACTORY: Record<
  CondOperator,
  (field: string, value: unknown) => WhereCondition
> = {
  [CondOperator.EQUALS]: (f, v) => Where.eq(f, v),
  [CondOperator.NOT_EQUALS]: (f, v) => Where.ne(f, v),
  [CondOperator.GREATER_THAN]: (f, v) => Where.gt(f, v),
  [CondOperator.LOWER_THAN]: (f, v) => Where.lt(f, v),
  [CondOperator.GREATER_THAN_EQUALS]: (f, v) => Where.gte(f, v),
  [CondOperator.LOWER_THAN_EQUALS]: (f, v) => Where.lte(f, v),
  [CondOperator.STARTS]: (f, v) => Where.starts(f, String(v)),
  [CondOperator.NOT_STARTS]: (f, v) => Where.notStarts(f, String(v)),
  [CondOperator.ENDS]: (f, v) => Where.ends(f, String(v)),
  [CondOperator.NOT_ENDS]: (f, v) => Where.notEnds(f, String(v)),
  [CondOperator.CONTAINS]: (f, v) => Where.contains(f, String(v)),
  [CondOperator.NOT_CONTAINS]: (f, v) => Where.notContains(f, String(v)),
  [CondOperator.IN]: (f, v) => Where.in(f, Array.isArray(v) ? v : []),
  [CondOperator.NOT_IN]: (f, v) => Where.notIn(f, Array.isArray(v) ? v : []),
  [CondOperator.IS_NULL]: (f) => Where.isNull(f),
  [CondOperator.NOT_NULL]: (f) => Where.notNull(f),
  [CondOperator.BETWEEN]: (f, v) => {
    const arr = Array.isArray(v) ? v : [];
    return Where.between(f, arr[0], arr[1]);
  },
};

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
  property: EntityColumn<Entity>;
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
        primaryKey: EntityColumn<Entity>;
        /**
         * The foreign key field name in the relation entity (holds the reference)
         */
        foreignKey: EntityColumn<Relation>;
      }
    // Root ownership: root[foreignKey] -> relation[primaryKey]
    | {
        owner: true;
        /**
         * The primary key field name in the relation entity (target of the reference)
         */
        primaryKey: EntityColumn<Relation>;
        /**
         * The foreign key field name in the root entity (holds the reference)
         */
        foreignKey: EntityColumn<Entity>;
      }
  );
