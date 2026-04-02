import { PlainLiteralObject } from '@nestjs/common';

import { OverlayRef } from './overlay-ref';

export type RefsToMethods<
  R extends OverlayRef<string, PlainLiteralObject, unknown[]>,
> = {
  [O in R as O['name']]: O extends OverlayRef<string, infer P, infer A>
    ? (...args: A) => P
    : never;
};
