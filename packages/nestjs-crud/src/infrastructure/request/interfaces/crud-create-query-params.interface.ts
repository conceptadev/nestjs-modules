import { PlainLiteralObject } from '@nestjs/common';

import {
  EntityColumn,
  SortCondition,
  SortConditionArr,
  WhereCondition,
  WhereConditionArr,
} from '@concepta/nestjs-common';

import { SCondition } from '../crud-query.types';

export interface CrudCreateQueryParamsInterface<
  T extends PlainLiteralObject = PlainLiteralObject,
> {
  fields?: EntityColumn<T>[];
  search?: SCondition<T>;
  filter?:
    | WhereCondition<T>
    | WhereConditionArr<T>
    | Array<WhereCondition<T> | WhereConditionArr<T>>;
  or?:
    | WhereCondition<T>
    | WhereConditionArr<T>
    | Array<WhereCondition<T> | WhereConditionArr<T>>;
  sort?:
    | SortCondition<T>
    | SortConditionArr<T>
    | Array<SortCondition<T> | SortConditionArr<T>>;
  limit?: number;
  offset?: number;
  page?: number;
  resetCache?: boolean;
  includeDeleted?: number;
}
