import { PlainLiteralObject } from '@nestjs/common';

import {
  WhereClause,
  WhereCompound,
  WhereCondition,
  WhereConditionArray,
  WhereConditionNullary,
  WhereConditionPair,
  WhereConditionScalar,
} from './interfaces/where-clause.interface';
import { WhereCompoundOperator, WhereOperator } from './repository.types';

/**
 * Where clause builder with both static and instance APIs.
 *
 * @example Static usage (pass Entity as generic per call):
 * ```typescript
 * repository.findOne(Where.where(Where.eq<User>('id', userId)));
 * repository.find(Where.where(Where.and(Where.eq<User>('status', 'active'), Where.gt<User>('age', 18))));
 * ```
 *
 * @example Typed builder (Entity bound via factory):
 * ```typescript
 * const w = Where.for<User>();
 * repository.find(w.where(w.and(w.eq('status', 'active'), w.gt('age', 18))));
 * ```
 */
export class Where<Entity extends PlainLiteralObject = PlainLiteralObject> {
  // ═══════════════════════════════════════════════════════════════════════════
  // Static API
  // ═══════════════════════════════════════════════════════════════════════════

  static eq<E extends PlainLiteralObject = PlainLiteralObject>(
    field: keyof E & string,
    value: unknown,
  ): WhereConditionScalar<E> {
    return { field, operator: WhereOperator.EQ, value };
  }

  static ne<E extends PlainLiteralObject = PlainLiteralObject>(
    field: keyof E & string,
    value: unknown,
  ): WhereConditionScalar<E> {
    return { field, operator: WhereOperator.NE, value };
  }

  static gt<E extends PlainLiteralObject = PlainLiteralObject>(
    field: keyof E & string,
    value: unknown,
  ): WhereConditionScalar<E> {
    return { field, operator: WhereOperator.GT, value };
  }

  static gte<E extends PlainLiteralObject = PlainLiteralObject>(
    field: keyof E & string,
    value: unknown,
  ): WhereConditionScalar<E> {
    return { field, operator: WhereOperator.GTE, value };
  }

  static lt<E extends PlainLiteralObject = PlainLiteralObject>(
    field: keyof E & string,
    value: unknown,
  ): WhereConditionScalar<E> {
    return { field, operator: WhereOperator.LT, value };
  }

  static lte<E extends PlainLiteralObject = PlainLiteralObject>(
    field: keyof E & string,
    value: unknown,
  ): WhereConditionScalar<E> {
    return { field, operator: WhereOperator.LTE, value };
  }

  static contains<E extends PlainLiteralObject = PlainLiteralObject>(
    field: keyof E & string,
    value: string,
  ): WhereConditionScalar<E> {
    return { field, operator: WhereOperator.CONTAINS, value };
  }

  static notContains<E extends PlainLiteralObject = PlainLiteralObject>(
    field: keyof E & string,
    value: string,
  ): WhereConditionScalar<E> {
    return { field, operator: WhereOperator.NCONTAINS, value };
  }

  static starts<E extends PlainLiteralObject = PlainLiteralObject>(
    field: keyof E & string,
    value: string,
  ): WhereConditionScalar<E> {
    return { field, operator: WhereOperator.STARTS, value };
  }

  static notStarts<E extends PlainLiteralObject = PlainLiteralObject>(
    field: keyof E & string,
    value: string,
  ): WhereConditionScalar<E> {
    return { field, operator: WhereOperator.NSTARTS, value };
  }

  static ends<E extends PlainLiteralObject = PlainLiteralObject>(
    field: keyof E & string,
    value: string,
  ): WhereConditionScalar<E> {
    return { field, operator: WhereOperator.ENDS, value };
  }

  static notEnds<E extends PlainLiteralObject = PlainLiteralObject>(
    field: keyof E & string,
    value: string,
  ): WhereConditionScalar<E> {
    return { field, operator: WhereOperator.NENDS, value };
  }

  static in<E extends PlainLiteralObject = PlainLiteralObject>(
    field: keyof E & string,
    value: unknown[],
  ): WhereConditionArray<E> {
    return { field, operator: WhereOperator.IN, value };
  }

  static notIn<E extends PlainLiteralObject = PlainLiteralObject>(
    field: keyof E & string,
    value: unknown[],
  ): WhereConditionArray<E> {
    return { field, operator: WhereOperator.NIN, value };
  }

  static isNull<E extends PlainLiteralObject = PlainLiteralObject>(
    field: keyof E & string,
  ): WhereConditionNullary<E> {
    return { field, operator: WhereOperator.IS_NULL };
  }

  static notNull<E extends PlainLiteralObject = PlainLiteralObject>(
    field: keyof E & string,
  ): WhereConditionNullary<E> {
    return { field, operator: WhereOperator.NOT_NULL };
  }

  static between<E extends PlainLiteralObject = PlainLiteralObject>(
    field: keyof E & string,
    from: unknown,
    to: unknown,
  ): WhereConditionPair<E> {
    return { field, operator: WhereOperator.BETWEEN, value: [from, to] };
  }

  static and(...conditions: WhereClause[]): WhereCompound {
    return { operator: WhereCompoundOperator.AND, conditions };
  }

  static or(...conditions: WhereClause[]): WhereCompound {
    return { operator: WhereCompoundOperator.OR, conditions };
  }

  static where(clause: WhereClause): { where: WhereClause } {
    return { where: clause };
  }

  static for<E extends PlainLiteralObject>(): Where<E> {
    return new Where<E>();
  }

  /**
   * Tag a WhereCondition with a relation name.
   *
   * @example
   * ```typescript
   * Where.rel('tasks', Where.eq('status', 'active'))
   * // => { field: 'status', operator: 'eq', value: 'active', relation: 'tasks' }
   * ```
   */
  static rel<
    E extends PlainLiteralObject = PlainLiteralObject,
    C extends WhereCondition<E> = WhereCondition<E>,
  >(relation: string, condition: C): C {
    return { ...condition, relation };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Instance API (field names checked against Entity)
  // ═══════════════════════════════════════════════════════════════════════════

  eq(
    field: keyof Entity & string,
    value: unknown,
  ): WhereConditionScalar<Entity> {
    return Where.eq(field, value);
  }

  ne(
    field: keyof Entity & string,
    value: unknown,
  ): WhereConditionScalar<Entity> {
    return Where.ne(field, value);
  }

  gt(
    field: keyof Entity & string,
    value: unknown,
  ): WhereConditionScalar<Entity> {
    return Where.gt(field, value);
  }

  gte(
    field: keyof Entity & string,
    value: unknown,
  ): WhereConditionScalar<Entity> {
    return Where.gte(field, value);
  }

  lt(
    field: keyof Entity & string,
    value: unknown,
  ): WhereConditionScalar<Entity> {
    return Where.lt(field, value);
  }

  lte(
    field: keyof Entity & string,
    value: unknown,
  ): WhereConditionScalar<Entity> {
    return Where.lte(field, value);
  }

  contains(
    field: keyof Entity & string,
    value: string,
  ): WhereConditionScalar<Entity> {
    return Where.contains(field, value);
  }

  notContains(
    field: keyof Entity & string,
    value: string,
  ): WhereConditionScalar<Entity> {
    return Where.notContains(field, value);
  }

  starts(
    field: keyof Entity & string,
    value: string,
  ): WhereConditionScalar<Entity> {
    return Where.starts(field, value);
  }

  notStarts(
    field: keyof Entity & string,
    value: string,
  ): WhereConditionScalar<Entity> {
    return Where.notStarts(field, value);
  }

  ends(
    field: keyof Entity & string,
    value: string,
  ): WhereConditionScalar<Entity> {
    return Where.ends(field, value);
  }

  notEnds(
    field: keyof Entity & string,
    value: string,
  ): WhereConditionScalar<Entity> {
    return Where.notEnds(field, value);
  }

  in(
    field: keyof Entity & string,
    value: unknown[],
  ): WhereConditionArray<Entity> {
    return Where.in(field, value);
  }

  notIn(
    field: keyof Entity & string,
    value: unknown[],
  ): WhereConditionArray<Entity> {
    return Where.notIn(field, value);
  }

  isNull(field: keyof Entity & string): WhereConditionNullary<Entity> {
    return Where.isNull(field);
  }

  notNull(field: keyof Entity & string): WhereConditionNullary<Entity> {
    return Where.notNull(field);
  }

  between(
    field: keyof Entity & string,
    from: unknown,
    to: unknown,
  ): WhereConditionPair<Entity> {
    return Where.between(field, from, to);
  }

  and(...conditions: WhereClause[]): WhereCompound {
    return Where.and(...conditions);
  }

  or(...conditions: WhereClause[]): WhereCompound {
    return Where.or(...conditions);
  }

  rel<C extends WhereCondition<Entity> = WhereCondition<Entity>>(
    relation: string,
    condition: C,
  ): C {
    return Where.rel(relation, condition);
  }

  /**
   * Wrap a WhereClause into a `{ where }` options object.
   */
  where(clause: WhereClause): { where: WhereClause } {
    return { where: clause };
  }
}
