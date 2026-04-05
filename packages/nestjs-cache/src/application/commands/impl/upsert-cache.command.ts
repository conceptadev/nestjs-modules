import { PlainLiteralObject } from '@nestjs/common';

import { CacheCreatableInterface } from '../../../domain/interfaces/cache-creatable.interface';

export class UpsertCacheCommand {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly namespace: string,
    public readonly dto: CacheCreatableInterface,
  ) {}
}
