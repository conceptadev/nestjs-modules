import { PlainLiteralObject } from '@nestjs/common';

import { CacheCreatableInterface, ReferenceId } from '@concepta/nestjs-common';

export class ReplaceCacheCommand {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly namespace: string,
    public readonly id: ReferenceId,
    public readonly dto: CacheCreatableInterface,
  ) {}
}
