import { PlainLiteralObject } from '@nestjs/common';

import {
  EntityColumn,
  JoinClause,
  SortCondition,
} from '@concepta/nestjs-common';

import { QueryFilterOption } from '../query-filter-option.type';

export interface CrudQueryOptionsInterface<T extends PlainLiteralObject> {
  allow?: EntityColumn<T>[];
  exclude?: EntityColumn<T>[];
  persist?: EntityColumn<T>[];
  filter?: QueryFilterOption<T>;
  sort?: SortCondition<T>[];
  limit?: number;
  maxLimit?: number;
  cache?: number | false;
  join?: JoinClause[];
}
