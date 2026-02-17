import { PlainLiteralObject } from '@nestjs/common';

import { EntityColumn, SortOrder } from '../repository.types';

/**
 * A sort condition on a single entity field.
 */
export interface SortCondition<
  T extends PlainLiteralObject = PlainLiteralObject,
> {
  field: EntityColumn<T>;
  order: SortOrder;
  relation?: string;
}
