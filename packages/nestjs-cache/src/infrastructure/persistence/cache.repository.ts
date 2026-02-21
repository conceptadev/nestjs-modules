import {
  CacheInterface,
  ReferenceId,
  RepositoryContextInterface,
  RepositoryInterface,
  Where,
} from '@concepta/nestjs-common';

import { Cache } from '../../domain/aggregates/cache';
import { CacheSettingsInterface } from '../config/interfaces/cache-settings.interface';

import { CacheNotFoundException } from './exceptions/cache-not-found.exception';

export class CacheRepository {
  constructor(
    protected readonly repository: RepositoryInterface<CacheInterface>,
    protected readonly settings: CacheSettingsInterface,
  ) {}

  async get(params: {
    id: ReferenceId;
    ctx?: RepositoryContextInterface;
  }): Promise<Cache> {
    const { id, ctx } = params;
    const w = Where.for<CacheInterface>();

    const entity = await this.repository.findOne({
      where: w.eq('id', id),
      ctx,
    });

    if (!entity) {
      throw new CacheNotFoundException(id);
    }

    return Cache.toInstance(entity, this.settings);
  }

  async findById(params: {
    id: ReferenceId;
    ctx?: RepositoryContextInterface;
  }): Promise<Cache | null> {
    const { id, ctx } = params;
    const w = Where.for<CacheInterface>();

    const entity = await this.repository.findOne({
      where: w.eq('id', id),
      ctx,
    });

    return entity ? Cache.toInstance(entity, this.settings) : null;
  }

  async findOne(params: {
    key: string;
    type: string;
    assigneeId: string;
    ctx?: RepositoryContextInterface;
  }): Promise<Cache | null> {
    const { key, type, assigneeId, ctx } = params;
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

  async findAllByAssignee(params: {
    assigneeId: string;
    ctx?: RepositoryContextInterface;
  }): Promise<Cache[]> {
    const { assigneeId, ctx } = params;
    const w = Where.for<CacheInterface>();

    const entities = await this.repository.find({
      where: w.eq('assigneeId', assigneeId),
      ctx,
    });

    return entities.map((e) => Cache.toInstance(e, this.settings));
  }

  async save(params: {
    cache: Cache;
    ctx?: RepositoryContextInterface;
  }): Promise<void> {
    const { cache, ctx } = params;
    const entity = await this.repository.upsert(cache.toPlain(), { ctx });
    cache.hydrate(entity);
  }

  async remove(params: {
    cache: Cache;
    ctx?: RepositoryContextInterface;
  }): Promise<void> {
    const { cache, ctx } = params;
    await this.repository.delete(cache.toPlain(), { ctx });
  }

  async removeAllByAssignee(params: {
    assigneeId: string;
    ctx?: RepositoryContextInterface;
  }): Promise<void> {
    const caches = await this.findAllByAssignee(params);

    for (const cache of caches) {
      await this.remove({ cache, ctx: params.ctx });
    }
  }

  async softRemove(params: {
    cache: Cache;
    ctx?: RepositoryContextInterface;
  }): Promise<void> {
    const { cache, ctx } = params;
    await this.repository.softDelete(cache.toPlain(), { ctx });
  }
}
