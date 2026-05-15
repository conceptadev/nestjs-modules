import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { CACHE_REPOSITORY_RESOLVER_TOKEN } from '../../../cache.constants';
import { Cache } from '../../../domain/aggregates/cache';
import { CacheRepositoryResolverInterface } from '../../../domain/repositories/cache-repository-resolver.interface';
import { FindCachesByAssigneeQuery } from '../impl/find-caches-by-assignee.query';

@QueryHandler(FindCachesByAssigneeQuery)
export class FindCachesByAssigneeHandler
  implements IQueryHandler<FindCachesByAssigneeQuery>
{
  constructor(
    @Inject(CACHE_REPOSITORY_RESOLVER_TOKEN)
    private readonly repositoryResolver: CacheRepositoryResolverInterface,
  ) {}

  async execute(query: FindCachesByAssigneeQuery): Promise<Cache[]> {
    const { ctx, namespace, assigneeId } = query;

    const cacheRepo = this.repositoryResolver.resolve(namespace);

    return cacheRepo.findAllByAssignee(ctx, assigneeId);
  }
}
