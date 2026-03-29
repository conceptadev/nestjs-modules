import { PlainLiteralObject } from '@nestjs/common';

import { OverlayRef } from './overlay-ref';

export type RefsToMethods<R extends OverlayRef<string, PlainLiteralObject>> = {
  [O in R as O['name']]: () => O extends OverlayRef<string, infer P>
    ? P
    : never;
};
