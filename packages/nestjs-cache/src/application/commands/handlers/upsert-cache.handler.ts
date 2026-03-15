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
import { UpsertCacheCommand } from '../impl/upsert-cache.command';

@CommandHandler(UpsertCacheCommand)
export class UpsertCacheHandler implements ICommandHandler<UpsertCacheCommand> {
  constructor(
    @Inject(CACHE_REPOSITORY_RESOLVER_TOKEN)
    private readonly repositoryResolver: CacheRepositoryResolverInterface,
    private readonly txScope: TransactionScope,
    private readonly eventPublisher: EventPublisher,
    @Inject(CACHE_MODULE_SETTINGS_TOKEN)
    private readonly settings: CacheSettingsInterface,
  ) {}

  async execute(command: UpsertCacheCommand): Promise<Cache> {
    const { ctx, dto } = command;
    const { key, type, data, assigneeId, expiresIn } = dto;

    const cacheRepo = this.repositoryResolver.resolve(ctx.entity);

    const eventContext = EventContextHost.builder<EntityHeaderInterface>()
      .setHeader('entity', ctx.entity)
      .build();

    return this.txScope.run(ctx, async (trx) => {
      let cache: Cache;

      const existing = await cacheRepo.findOne(ctx, { key, type, assigneeId });

      if (existing) {
        cache = this.eventPublisher.mergeObjectContext(existing);
        cache.updateData(eventContext, data);

        if (expiresIn) {
          cache.extend(eventContext, expiresIn);
        }
      } else {
        cache = this.eventPublisher.mergeObjectContext(
          Cache.create(eventContext, dto, this.settings),
        );
      }

      await cacheRepo.save(ctx, cache);

      trx.onCommit(ctx, () => cache.commit());
      trx.onRollback(ctx, () => cache.uncommit());

      return cache;
    });
  }
}
