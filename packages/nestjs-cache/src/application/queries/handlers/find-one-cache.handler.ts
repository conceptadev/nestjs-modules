import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { CacheInterface } from '@concepta/nestjs-common';

import { CacheRepositoryResolver } from '../../../infrastructure/persistence/cache-repository.resolver';
import { FindOneCacheQuery } from '../impl/find-one-cache.query';

@QueryHandler(FindOneCacheQuery)
export class FindOneCacheHandler implements IQueryHandler<FindOneCacheQuery> {
  constructor(private readonly repositoryResolver: CacheRepositoryResolver) {}

  async execute(query: FindOneCacheQuery): Promise<CacheInterface | null> {
    const { ctx, key, type, assigneeId } = query;

    const cacheRepo = this.repositoryResolver.resolve(ctx.entity);

    return cacheRepo.findOne(ctx, { key, type, assigneeId });
  }
}
