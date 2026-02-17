import { PlainLiteralObject } from '@nestjs/common';
import { isNil, isObject } from '@nestjs/common/utils/shared.utils';

import {
  EntityColumn,
  SortCondition,
  Where,
  WhereCondition,
  WhereConditionScalar,
} from '@concepta/nestjs-common';

import { CrudParamsOptionsInterface } from '../crud/interfaces/crud-params-options.interface';
import { hasValue, isDateString, isStringFull } from '../util/validation';

import { CrudQueryBuilder } from './crud-query.builder';
import { SCondition } from './crud-query.types';
import { splitSortString } from './crud-query.utils';
import {
  validateComparisonOperator,
  validateCondition,
  validateNumeric,
  validateParamOption,
  validateSort,
  validateUUID,
} from './crud-query.validator';
import { CrudQueryException } from './exceptions/crud-query.exception';
import { CrudParsedQueryInterface } from './interfaces/crud-parsed-query.interface';
import { CrudQueryBuilderOptionsInterface } from './interfaces/crud-query-builder-options.interface';

export class CrudQueryParser<Entity extends PlainLiteralObject>
  implements CrudParsedQueryInterface<Entity>
{
  public fields: EntityColumn<Entity>[] = [];

  /**
   * Route parameters as simple key-value pairs (e.g., \{ id: 5, userId: 'abc' \})
   */
  public routeParams: Record<string, unknown> = {};

  public search: SCondition<Entity> | undefined;

  public filter: WhereCondition<Entity>[] = [];

  public or: WhereCondition<Entity>[] = [];

  public sort: SortCondition<Entity>[] = [];

  public limit: number | undefined;

  public offset: number | undefined;

  public page: number | undefined;

  public cache: number | undefined;

  public includeDeleted: number | undefined;

  private _params: PlainLiteralObject = {};

  private _query: PlainLiteralObject = {};

  private _paramNames: string[] = [];

  private _paramsOptions: CrudParamsOptionsInterface<Entity> | undefined;

  private get _options(): Required<CrudQueryBuilderOptionsInterface> & {
    paramNamesMap: Required<CrudQueryBuilderOptionsInterface['paramNamesMap']>;
  } {
    return CrudQueryBuilder.getOptions();
  }

  static create<T extends PlainLiteralObject>(): CrudQueryParser<T> {
    return new CrudQueryParser();
  }

  /**
   * Get parsed query parameters (filter, sort, pagination, etc.)
   */
  getParsedQuery(): CrudParsedQueryInterface<Entity> {
    return {
      fields: this.fields,
      search: this.search,
      filter: this.filter,
      or: this.or,
      sort: this.sort,
      limit: this.limit,
      offset: this.offset,
      page: this.page,
      cache: this.cache,
      includeDeleted: this.includeDeleted,
    };
  }

  /**
   * Get route parameters as simple key-value object
   */
  getRouteParams(): Record<string, unknown> {
    return this.routeParams;
  }

  parseQuery(query: PlainLiteralObject): this {
    if (isObject(query)) {
      const paramNames = Object.keys(query);

      if (paramNames.length) {
        this._query = query;
        this._paramNames = paramNames;
        const searchData = this._query[this.getParamNames('search')[0]];
        this.search = this.parseSearchQueryParam(searchData);
        if (isNil(this.search)) {
          this.filter = this.parseFilterQueryParam();
          this.or = this.parseOrQueryParam();
        }
        this.fields =
          this.parseQueryParam('fields', this.fieldsParser.bind(this))[0] || [];
        this.sort = this.parseSortQueryParam();
        this.limit = this.parseQueryParam(
          'limit',
          this.numericParser.bind(this, 'limit'),
        )[0];
        this.offset = this.parseQueryParam(
          'offset',
          this.numericParser.bind(this, 'offset'),
        )[0];
        this.page = this.parseQueryParam(
          'page',
          this.numericParser.bind(this, 'page'),
        )[0];
        this.cache = this.parseQueryParam(
          'cache',
          this.numericParser.bind(this, 'cache'),
        )[0];
        this.includeDeleted = this.parseQueryParam(
          'includeDeleted',
          this.numericParser.bind(this, 'includeDeleted'),
        )[0];
      }
    }

    return this;
  }

  parseParams(
    params: PlainLiteralObject,
    options: CrudParamsOptionsInterface<Entity>,
  ): this {
    if (isObject(params)) {
      const paramNames = Object.keys(params);

      if (paramNames.length) {
        this._params = params;
        this._paramsOptions = options;

        // Build routeParams as simple key-value object
        for (const name of paramNames) {
          const parsedValue = this.paramParser(name);
          if (parsedValue !== undefined) {
            // Use the field name as key, store the parsed value
            this.routeParams[parsedValue.field] = parsedValue.value;
          }
        }
      }
    }

    return this;
  }

  private getParamNames(
    type: keyof NonNullable<CrudQueryBuilderOptionsInterface['paramNamesMap']>,
  ): string[] {
    return this._paramNames.filter((p) => {
      const aliases = this._options.paramNamesMap[type];

      // Check for exact match or array-style parameter names (e.g., 'filter[0]', 'filter[1]')
      return aliases.some((alias) => {
        return p === alias || p.startsWith(`${alias}[`);
      });
    });
  }

  private getParamValues<
    U extends keyof NonNullable<
      CrudQueryBuilderOptionsInterface['paramNamesMap']
    >,
    R extends CrudParsedQueryInterface<Entity>[U],
  >(value: string | string[], parser: (data: string) => R): R[] {
    if (typeof value === 'string' && isStringFull(value)) {
      return [parser(value)];
    }

    if (Array.isArray(value) && value.length) {
      return value.map((val) => parser(val));
    }

    return [];
  }

  private getFilterParamValues(
    value: NonNullable<
      CrudQueryBuilderOptionsInterface['paramNamesMap']
    >['filter'],
  ): WhereCondition<Entity>[] {
    const parser = this.conditionParser.bind(this, 'filter');

    if (typeof value === 'string' && isStringFull(value)) {
      return [parser.call(this, value)];
    }

    if (Array.isArray(value) && value.length) {
      return value.map((val) => parser(val));
    }

    return [];
  }

  private getOrParamValues(
    value: NonNullable<CrudQueryBuilderOptionsInterface['paramNamesMap']>['or'],
  ): WhereCondition<Entity>[] {
    const parser = this.conditionParser.bind(this, 'or');

    if (typeof value === 'string' && isStringFull(value)) {
      return [parser.call(this, value)];
    }

    if (Array.isArray(value) && value.length) {
      return value.map((val) => parser(val));
    }

    return [];
  }

  private getSortParamValues(
    value: NonNullable<
      CrudQueryBuilderOptionsInterface['paramNamesMap']
    >['sort'],
  ): SortCondition<Entity>[] {
    const parser = this.sortParser.bind(this);

    if (typeof value === 'string' && isStringFull(value)) {
      return [parser.call(this, value)];
    }

    if (Array.isArray(value) && value.length) {
      return value.map((val) => parser(val));
    }

    return [];
  }

  private parseQueryParam<
    U extends keyof NonNullable<
      CrudQueryBuilderOptionsInterface['paramNamesMap']
    >,
    R extends CrudParsedQueryInterface<Entity>[U],
  >(type: U, parser: (data: string) => R): R[] {
    const param = this.getParamNames(type);

    if (Array.isArray(param) && param.length) {
      return param.reduce(
        (a: R[], name) => [
          ...a,
          ...this.getParamValues<U, R>(this._query[name], parser),
        ],
        [],
      );
    }

    return [];
  }

  private parseFilterQueryParam(): WhereCondition<Entity>[] {
    const param = this.getParamNames('filter');

    if (Array.isArray(param) && param.length) {
      return param.reduce(
        (a: WhereCondition<Entity>[], name) => [
          ...a,
          ...this.getFilterParamValues(this._query[name]),
        ],
        [],
      );
    }

    return [];
  }

  private parseOrQueryParam(): WhereCondition<Entity>[] {
    const param = this.getParamNames('or');

    if (Array.isArray(param) && param.length) {
      return param.reduce(
        (a: WhereCondition<Entity>[], name) => [
          ...a,
          ...this.getOrParamValues(this._query[name]),
        ],
        [],
      );
    }

    return [];
  }

  private parseSortQueryParam(): SortCondition<Entity>[] {
    const param = this.getParamNames('sort');

    if (Array.isArray(param) && param.length) {
      return param.reduce(
        (a: SortCondition<Entity>[], name) => [
          ...a,
          ...this.getSortParamValues(this._query[name]),
        ],
        [],
      );
    }

    return [];
  }

  private parseValue(val: string) {
    try {
      const parsed = JSON.parse(val);

      if (parsed instanceof Date === false && isObject(parsed)) {
        return val;
      } else if (
        typeof parsed === 'number' &&
        parsed.toLocaleString('fullwide', { useGrouping: false }) !== val
      ) {
        // JS cannot handle big numbers. Leave it as a string to prevent data loss
        return val;
      }

      return parsed;
    } catch (_ignored) {
      if (isDateString(val)) {
        return new Date(val);
      }

      return val;
    }
  }

  private parseValues(vals: string | string[]) {
    if (Array.isArray(vals)) {
      return vals.map((v: string) => this.parseValue(v));
    } else {
      return this.parseValue(vals);
    }
  }

  private fieldsParser(data: string): EntityColumn<Entity>[] {
    return data.split(this._options.delimStr);
  }

  private parseSearchQueryParam(d: string): SCondition<Entity> | undefined {
    try {
      if (isNil(d)) {
        return undefined;
      }

      const data = JSON.parse(d);

      if (!isObject(data)) {
        throw new Error();
      }

      return data;
    } catch (_e) {
      throw new CrudQueryException({
        message: 'Invalid search param. JSON expected',
      });
    }
  }

  /**
   * Maps $-prefixed wire format operators to WhereCondition factory functions.
   * Each factory produces the correctly-typed discriminated union variant.
   */
  private static readonly COND_FACTORY: Record<
    string,
    (field: string, value: unknown) => WhereCondition
  > = {
    $eq: (f, v) => Where.eq(f, v),
    $ne: (f, v) => Where.ne(f, v),
    $gt: (f, v) => Where.gt(f, v),
    $lt: (f, v) => Where.lt(f, v),
    $gte: (f, v) => Where.gte(f, v),
    $lte: (f, v) => Where.lte(f, v),
    $starts: (f, v) => Where.starts(f, String(v)),
    $nstarts: (f, v) => Where.notStarts(f, String(v)),
    $ends: (f, v) => Where.ends(f, String(v)),
    $nends: (f, v) => Where.notEnds(f, String(v)),
    $contains: (f, v) => Where.contains(f, String(v)),
    $ncontains: (f, v) => Where.notContains(f, String(v)),
    $in: (f, v) => Where.in(f, Array.isArray(v) ? v : []),
    $nin: (f, v) => Where.notIn(f, Array.isArray(v) ? v : []),
    $null: (f) => Where.isNull(f),
    $nnull: (f) => Where.notNull(f),
    $between: (f, v) => {
      const arr = Array.isArray(v) ? v : [];
      return Where.between(f, arr[0], arr[1]);
    },
  };

  private conditionParser(
    cond: 'filter' | 'or',
    data: string,
  ): WhereCondition<Entity> {
    const isArrayValue = ['$in', '$nin', '$between'];
    const isEmptyValue = ['$null', '$nnull'];
    const param = data.split(this._options.delim);
    let field: string;
    let relation: string | undefined;

    if (param[0].includes('.')) {
      const parts = param[0].split('.');
      [relation, field] = parts;
    } else {
      field = param[0];
    }

    const operator = param[1];
    validateComparisonOperator(operator);

    let value: string | string[] = param[2] || '';

    if (isArrayValue.some((name) => name === operator)) {
      value = value.split(this._options.delimStr);
    }

    value = this.parseValues(value);

    if (!isEmptyValue.some((name) => name === operator) && !hasValue(value)) {
      throw new CrudQueryException({ message: `Invalid ${cond} value` });
    }

    const factory = CrudQueryParser.COND_FACTORY[operator];
    let condition = factory(field, value);

    if (relation) {
      condition = Where.rel(relation, condition);
    }

    validateCondition(condition, cond);

    return condition;
  }

  private sortParser(data: string): SortCondition<Entity> {
    const sort = splitSortString(data, this._options.delimStr);
    validateSort(sort);
    return sort;
  }

  private numericParser(
    num: 'limit' | 'offset' | 'page' | 'cache' | 'includeDeleted',
    data: string,
  ): number {
    const val = this.parseValue(data);
    validateNumeric(val, num);

    return val;
  }

  private paramParser(
    name: string,
  ): Pick<WhereConditionScalar, 'field' | 'value'> | undefined {
    const paramsOptions: CrudParamsOptionsInterface<Entity> =
      this._paramsOptions ?? {};

    validateParamOption(paramsOptions, name);
    const option = paramsOptions[name];

    if (
      'field' in option &&
      typeof option.field === 'string' &&
      option.disabled !== true
    ) {
      let value = this._params[name];

      switch (option.type) {
        case 'number':
          value = this.parseValue(value);
          validateNumeric(value, `param ${name}`);
          break;
        case 'uuid':
          validateUUID(value, name);
          break;
        default:
          break;
      }

      return { field: option.field, value };
    } else {
      return undefined;
    }
  }
}
