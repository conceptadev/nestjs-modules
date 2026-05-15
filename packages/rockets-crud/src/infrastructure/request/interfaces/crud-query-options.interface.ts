import { PlainLiteralObject } from '@nestjs/common';

import {
  EntityColumn,
  JoinClause,
  OrderSortKey,
} from '@concepta/rockets-repository';

import { QueryFilterOption } from '../query-filter-option.type';

export interface CrudQueryOptionsInterface<T extends PlainLiteralObject> {
  allow?: EntityColumn<T>[];
  exclude?: EntityColumn<T>[];
  persist?: EntityColumn<T>[];
  filter?: QueryFilterOption<T>;
  sort?: OrderSortKey<T>[];
  limit?: number;
  maxLimit?: number;
  cache?: number | false;
  join?: JoinClause[];
}
