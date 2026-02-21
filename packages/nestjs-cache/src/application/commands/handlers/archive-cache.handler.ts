import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TransactionScope } from '@concepta/nestjs-repository';

import { Cache } from '../../../domain/aggregates/cache';
import { CacheRepositoryResolver } from '../../../infrastructure/persistence/cache-repository.resolver';
import { ArchiveCacheCommand } from '../impl/archive-cache.command';

@CommandHandler(ArchiveCacheCommand)
export class ArchiveCacheHandler
  implements ICommandHandler<ArchiveCacheCommand>
{
  constructor(
    private readonly repositoryResolver: CacheRepositoryResolver,
    private readonly txScope: TransactionScope,
  ) {}

  async execute(command: ArchiveCacheCommand): Promise<Cache> {
    const { ctx, id } = command;

    const cacheRepo = this.repositoryResolver.resolve(ctx.entity);

    return this.txScope.run(ctx, async () => {
      const cache = await cacheRepo.get({ id, ctx });
      await cacheRepo.softRemove({ cache, ctx });
      return cache;
    });
  }
}
