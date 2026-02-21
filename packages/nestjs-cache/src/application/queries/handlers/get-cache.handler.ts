import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { Cache } from '../../../domain/aggregates/cache';
import { CacheRepositoryResolver } from '../../../infrastructure/persistence/cache-repository.resolver';
import { GetCacheQuery } from '../impl/get-cache.query';

@QueryHandler(GetCacheQuery)
export class GetCacheHandler implements IQueryHandler<GetCacheQuery> {
  constructor(private readonly repositoryResolver: CacheRepositoryResolver) {}

  async execute(query: GetCacheQuery): Promise<Cache> {
    const { ctx, id } = query;

    const cacheRepo = this.repositoryResolver.resolve(ctx.entity);

    return cacheRepo.get({ id, ctx });
  }
}
