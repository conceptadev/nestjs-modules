import {
  CacheInterface,
  ReferenceId,
  RepositoryContextInterface,
  RepositoryInterface,
  Where,
} from '@concepta/nestjs-common';

import { Cache } from '../../domain/aggregates/cache';
import { CacheSettingsInterface } from '../config/interfaces/cache-settings.interface';

export class CacheRepository {
  constructor(
    protected readonly repository: RepositoryInterface<CacheInterface>,
    protected readonly settings: CacheSettingsInterface,
  ) {}

  async get(
    ctx: RepositoryContextInterface,
    id: ReferenceId,
  ): Promise<Cache | null> {
    const w = Where.for<CacheInterface>();

    const entity = await this.repository.findOne({
      where: w.eq('id', id),
      ctx,
    });

    return entity ? Cache.toInstance(entity, this.settings) : null;
  }

  async findById(
    ctx: RepositoryContextInterface,
    id: ReferenceId,
  ): Promise<Cache | null> {
    const w = Where.for<CacheInterface>();

    const entity = await this.repository.findOne({
      where: w.eq('id', id),
      ctx,
    });

    return entity ? Cache.toInstance(entity, this.settings) : null;
  }

  async findOne(
    ctx: RepositoryContextInterface,
    options: { key: string; type: string; assigneeId: string },
  ): Promise<Cache | null> {
    const { key, type, assigneeId } = options;
    const w = Where.for<CacheInterface>();

    const entity = await this.repository.findOne({
      where: w.and(
        w.eq('key', key),
        w.eq('type', type),
        w.eq('assigneeId', assigneeId),
      ),
      ctx,
    });

    return entity ? Cache.toInstance(entity, this.settings) : null;
  }

  async findAllByAssignee(
    ctx: RepositoryContextInterface,
    assigneeId: string,
  ): Promise<Cache[]> {
    const w = Where.for<CacheInterface>();

    const entities = await this.repository.find({
      where: w.eq('assigneeId', assigneeId),
      ctx,
    });

    return entities.map((e) => Cache.toInstance(e, this.settings));
  }

  async save(ctx: RepositoryContextInterface, cache: Cache): Promise<void> {
    const entity = await this.repository.upsert(cache.toPlain(), { ctx });
    cache.hydrate(entity);
  }

  async remove(ctx: RepositoryContextInterface, cache: Cache): Promise<void> {
    await this.repository.delete(cache.toPlain(), { ctx });
  }

  async removeAllByAssignee(
    ctx: RepositoryContextInterface,
    assigneeId: string,
  ): Promise<void> {
    const caches = await this.findAllByAssignee(ctx, assigneeId);

    for (const cache of caches) {
      await this.remove(ctx, cache);
    }
  }

  async softRemove(
    ctx: RepositoryContextInterface,
    cache: Cache,
  ): Promise<void> {
    await this.repository.softDelete(cache.toPlain(), { ctx });
  }
}
