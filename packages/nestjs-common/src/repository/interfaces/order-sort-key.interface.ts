import { PlainLiteralObject } from '@nestjs/common';

import { EntityColumn, SortOrder } from '../repository.types';

// ═══════════════════════════════════════════════════════════════════════════════
// OrderSortKey variants — discriminated union on `order`
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * A sort key with ascending order.
 */
export interface OrderSortKeyAsc<
  T extends PlainLiteralObject = PlainLiteralObject,
> {
  field: EntityColumn<T>;
  order: typeof SortOrder.ASC;
  relation?: string;
}

/**
 * A sort key with descending order.
 */
export interface OrderSortKeyDesc<
  T extends PlainLiteralObject = PlainLiteralObject,
> {
  field: EntityColumn<T>;
  order: typeof SortOrder.DESC;
  relation?: string;
}
