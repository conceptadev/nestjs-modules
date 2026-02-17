import { PlainLiteralObject } from '@nestjs/common';

import { EntityColumn, SortCondition } from '@concepta/nestjs-common';

import { QueryFilterOption } from '../types/query-filter-option.type';

import { CrudRelationsInterface } from './crud-relations.interface';

export interface CrudQueryOptionsInterface<
  T extends PlainLiteralObject,
  Relations extends PlainLiteralObject[] = PlainLiteralObject[],
> {
  allow?: EntityColumn<T>[];
  exclude?: EntityColumn<T>[];
  persist?: EntityColumn<T>[];
  filter?: QueryFilterOption<T>;
  sort?: SortCondition<T>[];
  limit?: number;
  maxLimit?: number;
  cache?: number | false;
  relations?: CrudRelationsInterface<T, Relations>;
}
