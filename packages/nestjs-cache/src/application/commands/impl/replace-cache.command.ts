import { PlainLiteralObject } from '@nestjs/common';

import { ReferenceId } from '@concepta/nestjs-common';

import { CacheCreatableInterface } from '../../../domain/interfaces/cache-creatable.interface';

export class ReplaceCacheCommand {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly namespace: string,
    public readonly id: ReferenceId,
    public readonly dto: CacheCreatableInterface,
  ) {}
}
