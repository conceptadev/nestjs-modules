import { PlainLiteralObject } from '@nestjs/common';
import { Command } from '@nestjs/cqrs';

import { ReferenceId } from '@concepta/nestjs-common';

import { Cache } from '../../../domain/aggregates/cache';

export class ArchiveCacheCommand extends Command<Cache> {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly namespace: string,
    public readonly id: ReferenceId,
  ) {
    super();
  }
}
