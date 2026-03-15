import { Inject } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';

import {
  EntityHeaderInterface,
  EventContextHost,
} from '@concepta/nestjs-common';
import { TransactionScope } from '@concepta/nestjs-repository';

import {
  CACHE_MODULE_SETTINGS_TOKEN,
  CACHE_REPOSITORY_RESOLVER_TOKEN,
} from '../../../cache.constants';
import { Cache } from '../../../domain/aggregates/cache';
import { CacheRepositoryResolverInterface } from '../../../domain/repositories/cache-repository-resolver.interface';
import { CacheSettingsInterface } from '../../../infrastructure/config/interfaces/cache-settings.interface';
import { ReplaceCacheCommand } from '../impl/replace-cache.command';

@CommandHandler(ReplaceCacheCommand)
export class ReplaceCacheHandler
  implements ICommandHandler<ReplaceCacheCommand>
{
  constructor(
    @Inject(CACHE_REPOSITORY_RESOLVER_TOKEN)
    private readonly repositoryResolver: CacheRepositoryResolverInterface,
    private readonly txScope: TransactionScope,
    private readonly eventPublisher: EventPublisher,
    @Inject(CACHE_MODULE_SETTINGS_TOKEN)
    private readonly settings: CacheSettingsInterface,
  ) {}

  async execute(command: ReplaceCacheCommand): Promise<Cache> {
    const { ctx, id, dto } = command;

    const cacheRepo = this.repositoryResolver.resolve(ctx.entity);

    const eventContext = EventContextHost.builder<EntityHeaderInterface>()
      .setHeader('entity', ctx.entity)
      .build();

    return this.txScope.run(ctx, async (trx) => {
      let cache: Cache;

      const existing = await cacheRepo.findById(ctx, id);

      if (existing) {
        cache = this.eventPublisher.mergeObjectContext(existing);
        cache.replace(eventContext, dto);
      } else {
        cache = this.eventPublisher.mergeObjectContext(
          Cache.createWithId(eventContext, id, dto, this.settings),
        );
      }

      await cacheRepo.save(ctx, cache);

      trx.onCommit(ctx, () => cache.commit());
      trx.onRollback(ctx, () => cache.uncommit());

      return cache;
    });
  }
}
