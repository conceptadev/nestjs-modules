import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TransactionScope } from '@concepta/nestjs-repository';

import { Cache } from '../../../domain/aggregates/cache';
import { CacheRepositoryResolver } from '../../../infrastructure/persistence/cache-repository.resolver';
import { RemoveCacheCommand } from '../impl/remove-cache.command';

@CommandHandler(RemoveCacheCommand)
export class RemoveCacheHandler implements ICommandHandler<RemoveCacheCommand> {
  constructor(
    private readonly repositoryResolver: CacheRepositoryResolver,
    private readonly txScope: TransactionScope,
  ) {}

  async execute(command: RemoveCacheCommand): Promise<Cache> {
    const { ctx, id } = command;

    const cacheRepo = this.repositoryResolver.resolve(ctx.entity);

    return this.txScope.run(ctx, async () => {
      const cache = await cacheRepo.get({ id, ctx });
      await cacheRepo.remove({ cache, ctx });
      return cache;
    });
  }
}
