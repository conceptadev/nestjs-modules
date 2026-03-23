import { ExecutionContext, PlainLiteralObject } from '@nestjs/common';

export interface ContextOverlayInterface<
  Name extends string = string,
  Props extends PlainLiteralObject = PlainLiteralObject,
> {
  readonly name: Name;
  resolve(context: ExecutionContext): Props;
}
