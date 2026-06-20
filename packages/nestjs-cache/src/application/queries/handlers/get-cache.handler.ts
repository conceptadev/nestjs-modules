import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { CACHE_REPOSITORY_RESOLVER_TOKEN } from '../../../cache.constants';
import { Cache } from '../../../domain/aggregates/cache';
import { CacheRepositoryResolverInterface } from '../../../domain/repositories/cache-repository-resolver.interface';
import { CacheNotFoundException } from '../../exceptions/cache-not-found.exception';
import { GetCacheQuery } from '../impl/get-cache.query';

@QueryHandler(GetCacheQuery)
export class GetCacheHandler implements IQueryHandler<GetCacheQuery> {
  constructor(
    @Inject(CACHE_REPOSITORY_RESOLVER_TOKEN)
    private readonly repositoryResolver: CacheRepositoryResolverInterface,
  ) {}

  async execute(query: GetCacheQuery): Promise<Cache> {
    const { ctx, namespace, id } = query;

    const cacheRepo = this.repositoryResolver.resolve(namespace);

    const cache = await cacheRepo.get(ctx, id);

    if (!cache) {
      throw new CacheNotFoundException(id);
    }

    return cache;
  }
}
