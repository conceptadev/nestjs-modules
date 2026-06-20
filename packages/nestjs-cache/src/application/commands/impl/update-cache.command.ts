import { PlainLiteralObject } from '@nestjs/common';
import { Command } from '@nestjs/cqrs';

import { ReferenceId } from '@concepta/nestjs-core';

import { Cache } from '../../../domain/aggregates/cache';
import { CacheUpdatableInterface } from '../../../domain/interfaces/cache-updatable.interface';

export class UpdateCacheCommand extends Command<Cache> {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly namespace: string,
    public readonly id: ReferenceId,
    public readonly dto: CacheUpdatableInterface,
  ) {
    super();
  }
}
