import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TransactionScope } from '@concepta/nestjs-repository';

import { CACHE_REPOSITORY_RESOLVER_TOKEN } from '../../../cache.constants';
import { Cache } from '../../../domain/aggregates/cache';
import { CacheRepositoryResolverInterface } from '../../../domain/repositories/cache-repository-resolver.interface';
import { CacheNotFoundException } from '../../exceptions/cache-not-found.exception';
import { RemoveCacheCommand } from '../impl/remove-cache.command';

@CommandHandler(RemoveCacheCommand)
export class RemoveCacheHandler implements ICommandHandler<RemoveCacheCommand> {
  constructor(
    @Inject(CACHE_REPOSITORY_RESOLVER_TOKEN)
    private readonly repositoryResolver: CacheRepositoryResolverInterface,
    private readonly txScope: TransactionScope,
  ) {}

  async execute(command: RemoveCacheCommand): Promise<Cache> {
    const { ctx, id } = command;

    const cacheRepo = this.repositoryResolver.resolve(ctx.entity);

    return this.txScope.run(ctx, async () => {
      const cache = await cacheRepo.get(ctx, id);

      if (!cache) {
        throw new CacheNotFoundException(id);
      }

      await cacheRepo.remove(ctx, cache);
      return cache;
    });
  }
}
