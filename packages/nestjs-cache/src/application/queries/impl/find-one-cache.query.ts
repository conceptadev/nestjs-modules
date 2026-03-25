import { PlainLiteralObject } from '@nestjs/common';

export class FindOneCacheQuery {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly namespace: string,
    public readonly key: string,
    public readonly type: string,
    public readonly assigneeId: string,
  ) {}
}
