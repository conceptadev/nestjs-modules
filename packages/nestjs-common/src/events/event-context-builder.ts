import { PlainLiteralObject } from '@nestjs/common';

import { EventContextHost } from './event-context.host';

export class EventContextBuilder<
  H extends PlainLiteralObject,
  M extends PlainLiteralObject,
  CurrentH extends Partial<H> = {},
  CurrentM extends Partial<M> = {},
> {
  private constructor(
    private readonly _headers: CurrentH,
    private readonly _metadata: CurrentM,
  ) {}

  static start<
    H extends PlainLiteralObject,
    M extends PlainLiteralObject,
  >(): EventContextBuilder<H, M, {}, {}> {
    return new EventContextBuilder({}, {});
  }

  setHeader<K extends keyof H>(
    key: K,
    value: H[K],
  ): EventContextBuilder<H, M, CurrentH & Pick<H, K>, CurrentM> {
    const newHeaders = { ...this._headers, [key]: value } as CurrentH &
      Pick<H, K>;
    return new EventContextBuilder(newHeaders, this._metadata);
  }

  mergeMeta<T extends Partial<M>>(
    obj: T,
  ): EventContextBuilder<H, M, CurrentH, CurrentM & T> {
    const newMeta = { ...this._metadata, ...obj } as CurrentM & T;
    return new EventContextBuilder(this._headers, newMeta);
  }

  build(this: EventContextBuilder<H, M, H, M>): EventContextHost<H, M> {
    return new EventContextHost(this._headers, this._metadata);
  }
}
