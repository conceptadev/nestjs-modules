import { PlainLiteralObject } from '@nestjs/common';
import { Command } from '@nestjs/cqrs';

import { ReferenceId } from '@concepta/nestjs-core';

import { Cache } from '../../../domain/aggregates/cache';
import { CacheCreatableInterface } from '../../../domain/interfaces/cache-creatable.interface';

export class ReplaceCacheCommand extends Command<Cache> {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly namespace: string,
    public readonly id: ReferenceId,
    public readonly dto: CacheCreatableInterface,
  ) {
    super();
  }
}
