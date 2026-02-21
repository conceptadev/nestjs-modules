import { Inject } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';

import { TransactionScope } from '@concepta/nestjs-repository';

import { CACHE_MODULE_SETTINGS_TOKEN } from '../../../cache.constants';
import { Cache } from '../../../domain/aggregates/cache';
import { CacheSettingsInterface } from '../../../infrastructure/config/interfaces/cache-settings.interface';
import { CacheRepositoryResolver } from '../../../infrastructure/persistence/cache-repository.resolver';
import { ReplaceCacheCommand } from '../impl/replace-cache.command';

@CommandHandler(ReplaceCacheCommand)
export class ReplaceCacheHandler
  implements ICommandHandler<ReplaceCacheCommand>
{
  constructor(
    private readonly repositoryResolver: CacheRepositoryResolver,
    private readonly txScope: TransactionScope,
    private readonly eventPublisher: EventPublisher,
    @Inject(CACHE_MODULE_SETTINGS_TOKEN)
    private readonly settings: CacheSettingsInterface,
  ) {}

  async execute(command: ReplaceCacheCommand): Promise<Cache> {
    const { ctx, id, dto } = command;

    const cacheRepo = this.repositoryResolver.resolve(ctx.entity);

    return this.txScope.run(ctx, async (trx) => {
      let cache: Cache;

      const existing = await cacheRepo.findById({ id, ctx });

      if (existing) {
        cache = this.eventPublisher.mergeObjectContext(existing);
        cache.replace(dto);
      } else {
        cache = this.eventPublisher.mergeObjectContext(
          Cache.createWithId(id, dto, this.settings),
        );
      }

      await cacheRepo.save({ cache, ctx });

      trx.onCommit(ctx, () => cache.commit());
      trx.onRollback(ctx, () => cache.uncommit());

      return cache;
    });
  }
}
