import { ExecutionContext, PlainLiteralObject } from '@nestjs/common';

import { OverlayRef } from '../overlay-ref';

export interface ContextOverlayInterface<
  Name extends string = string,
  Props extends PlainLiteralObject = PlainLiteralObject,
> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly ref: OverlayRef<Name, Props, any[]>;
  attach(context: ExecutionContext): void;
}
