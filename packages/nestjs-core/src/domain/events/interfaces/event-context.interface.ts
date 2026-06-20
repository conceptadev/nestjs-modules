import { PlainLiteralObject } from '@nestjs/common';

export interface EventContextInterface<
  H extends PlainLiteralObject = PlainLiteralObject,
  M extends PlainLiteralObject = PlainLiteralObject,
> {
  headers: H;
  metadata: M;
}
