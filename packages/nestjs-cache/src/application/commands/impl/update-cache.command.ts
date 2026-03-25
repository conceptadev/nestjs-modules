import { PlainLiteralObject } from '@nestjs/common';

import { CacheUpdatableInterface, ReferenceId } from '@concepta/nestjs-common';

export class UpdateCacheCommand {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly namespace: string,
    public readonly id: ReferenceId,
    public readonly dto: CacheUpdatableInterface,
  ) {}
}
