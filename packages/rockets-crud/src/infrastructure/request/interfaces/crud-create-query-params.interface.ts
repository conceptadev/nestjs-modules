import { PlainLiteralObject } from '@nestjs/common';

import {
  EntityColumn,
  OrderSortKey,
  OrderSortKeyArr,
  WhereCondition,
  WhereConditionArr,
} from '@concepta/rockets-repository';

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
    | OrderSortKey<T>
    | OrderSortKeyArr<T>
    | Array<OrderSortKey<T> | OrderSortKeyArr<T>>;
  limit?: number;
  offset?: number;
  page?: number;
  resetCache?: boolean;
  includeDeleted?: number;
}
