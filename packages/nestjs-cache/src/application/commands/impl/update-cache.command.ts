import { PlainLiteralObject } from '@nestjs/common';

import { ReferenceId } from '@concepta/nestjs-common';

import { CacheUpdatableInterface } from '../../../domain/interfaces/cache-updatable.interface';

export class UpdateCacheCommand {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly namespace: string,
    public readonly id: ReferenceId,
    public readonly dto: CacheUpdatableInterface,
  ) {}
}
