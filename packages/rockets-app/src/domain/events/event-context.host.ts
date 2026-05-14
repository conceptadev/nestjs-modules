import { PlainLiteralObject } from '@nestjs/common';

import { EventContextInterface } from './interfaces/event-context.interface';

export class EventContextHost<
  H extends PlainLiteralObject = PlainLiteralObject,
  M extends PlainLiteralObject = PlainLiteralObject,
> implements EventContextInterface<H, M>
{
  readonly headers: H;
  readonly metadata: M;

  constructor(headers: H, metadata: M) {
    this.headers = { ...headers };
    this.metadata = { ...metadata };
    Object.freeze(this);
  }

  getHeader<K extends keyof H>(key: K): H[K] {
    return this.headers[key];
  }

  getMeta<K extends keyof M>(key: K): M[K] {
    return this.metadata[key];
  }
}
