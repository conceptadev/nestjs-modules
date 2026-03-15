import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { CacheInterface } from '@concepta/nestjs-common';

import { CACHE_REPOSITORY_RESOLVER_TOKEN } from '../../../cache.constants';
import { CacheRepositoryResolverInterface } from '../../../domain/repositories/cache-repository-resolver.interface';
import { FindOneCacheQuery } from '../impl/find-one-cache.query';

@QueryHandler(FindOneCacheQuery)
export class FindOneCacheHandler implements IQueryHandler<FindOneCacheQuery> {
  constructor(
    @Inject(CACHE_REPOSITORY_RESOLVER_TOKEN)
    private readonly repositoryResolver: CacheRepositoryResolverInterface,
  ) {}

  async execute(query: FindOneCacheQuery): Promise<CacheInterface | null> {
    const { ctx, key, type, assigneeId } = query;

    const cacheRepo = this.repositoryResolver.resolve(ctx.entity);

    return cacheRepo.findOne(ctx, { key, type, assigneeId });
  }
}
