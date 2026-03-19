import { ReferenceId } from '@concepta/nestjs-common';
import {
  RepositoryContextInterface,
  RepositoryInterface,
  Where,
} from '@concepta/nestjs-repository';

import { Cache } from '../../domain/aggregates/cache';
import { CacheRepositoryInterface } from '../../domain/repositories/cache-repository.interface';

import { CacheMapper } from './cache.mapper';
import { CacheEntityInterface } from './interfaces/cache-entity.interface';

export class CacheRepository implements CacheRepositoryInterface {
  constructor(
    protected readonly repository: RepositoryInterface<CacheEntityInterface>,
    private readonly mapper: CacheMapper,
  ) {}

  async get(
    ctx: RepositoryContextInterface,
    id: ReferenceId,
  ): Promise<Cache | null> {
    const w = Where.for<CacheEntityInterface>();

    const entity = await this.repository.findOne({
      where: w.eq('id', id),
      ctx,
    });

    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findOne(
    ctx: RepositoryContextInterface,
    options: { key: string; type: string; assigneeId: string },
  ): Promise<Cache | null> {
    const { key, type, assigneeId } = options;
    const w = Where.for<CacheEntityInterface>();

    const entity = await this.repository.findOne({
      where: w.and(
        w.eq('key', key),
        w.eq('type', type),
        w.eq('assigneeId', assigneeId),
      ),
      ctx,
    });

    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findAllByAssignee(
    ctx: RepositoryContextInterface,
    assigneeId: string,
  ): Promise<Cache[]> {
    const w = Where.for<CacheEntityInterface>();

    const entities = await this.repository.find({
      where: w.eq('assigneeId', assigneeId),
      ctx,
    });

    return entities.map((e) => this.mapper.toDomain(e));
  }

  async save(ctx: RepositoryContextInterface, cache: Cache): Promise<void> {
    cache.stampUpdated();
    await this.repository.upsert(this.mapper.toPersistence(cache), { ctx });
  }

  async remove(ctx: RepositoryContextInterface, cache: Cache): Promise<void> {
    await this.repository.delete(this.mapper.toPersistence(cache), { ctx });
  }

  async removeAllByAssignee(
    ctx: RepositoryContextInterface,
    assigneeId: string,
  ): Promise<void> {
    const caches = await this.findAllByAssignee(ctx, assigneeId);

    await this.repository.deleteMany(
      caches.map((cache) => this.mapper.toPersistence(cache)),
      { ctx },
    );
  }

  async softRemove(
    ctx: RepositoryContextInterface,
    cache: Cache,
  ): Promise<void> {
    cache.stampDeleted();
    await this.repository.softDelete(this.mapper.toPersistence(cache), { ctx });
  }
}
