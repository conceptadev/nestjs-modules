import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { CacheInterface } from '@concepta/nestjs-common';

import { CacheRepositoryResolver } from '../../../infrastructure/persistence/cache-repository.resolver';
import { FindCachesByAssigneeQuery } from '../impl/find-caches-by-assignee.query';

@QueryHandler(FindCachesByAssigneeQuery)
export class FindCachesByAssigneeHandler
  implements IQueryHandler<FindCachesByAssigneeQuery>
{
  constructor(private readonly repositoryResolver: CacheRepositoryResolver) {}

  async execute(query: FindCachesByAssigneeQuery): Promise<CacheInterface[]> {
    const { ctx, assigneeId } = query;

    const cacheRepo = this.repositoryResolver.resolve(ctx.entity);

    return cacheRepo.findAllByAssignee(ctx, assigneeId);
  }
}
