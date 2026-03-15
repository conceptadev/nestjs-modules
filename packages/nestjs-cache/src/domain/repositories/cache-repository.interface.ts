import {
  ReferenceId,
  RepositoryContextInterface,
} from '@concepta/nestjs-common';

import { Cache } from '../aggregates/cache';

export interface CacheRepositoryInterface {
  get(ctx: RepositoryContextInterface, id: ReferenceId): Promise<Cache | null>;

  findById(
    ctx: RepositoryContextInterface,
    id: ReferenceId,
  ): Promise<Cache | null>;

  findOne(
    ctx: RepositoryContextInterface,
    options: { key: string; type: string; assigneeId: string },
  ): Promise<Cache | null>;

  findAllByAssignee(
    ctx: RepositoryContextInterface,
    assigneeId: string,
  ): Promise<Cache[]>;

  save(ctx: RepositoryContextInterface, cache: Cache): Promise<void>;

  remove(ctx: RepositoryContextInterface, cache: Cache): Promise<void>;

  removeAllByAssignee(
    ctx: RepositoryContextInterface,
    assigneeId: string,
  ): Promise<void>;

  softRemove(ctx: RepositoryContextInterface, cache: Cache): Promise<void>;
}
