import { ExecutionContext, PlainLiteralObject } from '@nestjs/common';

import { OverlayRef } from '../overlay-ref';

export interface ContextOverlayInterface<
  Name extends string = string,
  Props extends PlainLiteralObject = PlainLiteralObject,
> {
  readonly ref: OverlayRef<Name, Props>;
  resolve(context?: ExecutionContext): Props;
  attach(context: ExecutionContext): void;
}
