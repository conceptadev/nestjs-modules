import { Inject } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';

import {
  EntityHeaderInterface,
  EventContextHost,
} from '@concepta/nestjs-common';
import { TransactionScope } from '@concepta/nestjs-repository';

import { CACHE_MODULE_SETTINGS_TOKEN } from '../../../cache.constants';
import { Cache } from '../../../domain/aggregates/cache';
import { CacheSettingsInterface } from '../../../infrastructure/config/interfaces/cache-settings.interface';
import { CacheRepositoryResolver } from '../../../infrastructure/persistence/cache-repository.resolver';
import { CreateCacheCommand } from '../impl/create-cache.command';

@CommandHandler(CreateCacheCommand)
export class CreateCacheHandler implements ICommandHandler<CreateCacheCommand> {
  constructor(
    private readonly repositoryResolver: CacheRepositoryResolver,
    private readonly txScope: TransactionScope,
    private readonly eventPublisher: EventPublisher,
    @Inject(CACHE_MODULE_SETTINGS_TOKEN)
    private readonly cacheSettings: CacheSettingsInterface,
  ) {}

  async execute(command: CreateCacheCommand): Promise<Cache> {
    const { ctx, dto } = command;

    const cacheRepo = this.repositoryResolver.resolve(ctx.entity);

    const eventContext = EventContextHost.builder<EntityHeaderInterface>()
      .setHeader('entity', ctx.entity)
      .build();

    return this.txScope.run(ctx, async (trx) => {
      const cache = this.eventPublisher.mergeObjectContext(
        Cache.create(eventContext, dto, this.cacheSettings),
      );

      await cacheRepo.save(ctx, cache);

      trx.onCommit(ctx, () => cache.commit());
      trx.onRollback(ctx, () => cache.uncommit());

      return cache;
    });
  }
}
