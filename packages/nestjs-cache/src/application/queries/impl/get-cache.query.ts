import { PlainLiteralObject } from '@nestjs/common';
import { Query } from '@nestjs/cqrs';

import { ReferenceId } from '@concepta/nestjs-core';

import { Cache } from '../../../domain/aggregates/cache';

export class GetCacheQuery extends Query<Cache> {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly namespace: string,
    public readonly id: ReferenceId,
  ) {
    super();
  }
}
