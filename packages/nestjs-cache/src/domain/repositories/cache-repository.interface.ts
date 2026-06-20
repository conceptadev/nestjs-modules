import { PlainLiteralObject } from '@nestjs/common';

import { ReferenceId } from '@concepta/nestjs-core';

import { Cache } from '../aggregates/cache';

export interface CacheRepositoryInterface {
  get(ctx: PlainLiteralObject, id: ReferenceId): Promise<Cache | null>;

  findOne(
    ctx: PlainLiteralObject,
    options: { key: string; type: string; assigneeId: string },
  ): Promise<Cache | null>;

  findAllByAssignee(
    ctx: PlainLiteralObject,
    assigneeId: string,
  ): Promise<Cache[]>;

  save(ctx: PlainLiteralObject, cache: Cache): Promise<void>;

  remove(ctx: PlainLiteralObject, cache: Cache): Promise<void>;

  removeAllByAssignee(
    ctx: PlainLiteralObject,
    assigneeId: string,
  ): Promise<void>;

  softRemove(ctx: PlainLiteralObject, cache: Cache): Promise<void>;
}
