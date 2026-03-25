import { PlainLiteralObject } from '@nestjs/common';

import { CacheCreatableInterface } from '@concepta/nestjs-common';

export class CreateCacheCommand {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly namespace: string,
    public readonly dto: CacheCreatableInterface,
  ) {}
}
