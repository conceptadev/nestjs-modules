import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { Cache } from '../../../domain/aggregates/cache';
import { CacheRepositoryResolver } from '../../../infrastructure/persistence/cache-repository.resolver';
import { CacheNotFoundException } from '../../exceptions/cache-not-found.exception';
import { GetCacheQuery } from '../impl/get-cache.query';

@QueryHandler(GetCacheQuery)
export class GetCacheHandler implements IQueryHandler<GetCacheQuery> {
  constructor(private readonly repositoryResolver: CacheRepositoryResolver) {}

  async execute(query: GetCacheQuery): Promise<Cache> {
    const { ctx, id } = query;

    const cacheRepo = this.repositoryResolver.resolve(ctx.entity);

    const cache = await cacheRepo.get(ctx, id);

    if (!cache) {
      throw new CacheNotFoundException(id);
    }

    return cache;
  }
}
