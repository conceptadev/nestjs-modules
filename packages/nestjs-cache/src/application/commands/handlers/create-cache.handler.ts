import { Inject } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';

import {
  EntityHeaderInterface,
  EventContextHost,
} from '@concepta/nestjs-common';
import { TransactionScope } from '@concepta/nestjs-repository';

import { CACHE_REPOSITORY_RESOLVER_TOKEN } from '../../../cache.constants';
import { Cache } from '../../../domain/aggregates/cache';
import { CacheExpirationPolicy } from '../../../domain/policies/cache-expiration.policy';
import { CacheRepositoryResolverInterface } from '../../../domain/repositories/cache-repository-resolver.interface';
import { CreateCacheCommand } from '../impl/create-cache.command';

@CommandHandler(CreateCacheCommand)
export class CreateCacheHandler implements ICommandHandler<CreateCacheCommand> {
  constructor(
    @Inject(CACHE_REPOSITORY_RESOLVER_TOKEN)
    private readonly repositoryResolver: CacheRepositoryResolverInterface,
    private readonly txScope: TransactionScope,
    private readonly eventPublisher: EventPublisher,
    private readonly expirationPolicy: CacheExpirationPolicy,
  ) {}

  async execute(command: CreateCacheCommand): Promise<Cache> {
    const { ctx, dto } = command;

    const cacheRepo = this.repositoryResolver.resolve(ctx.entity);

    const eventContext = EventContextHost.builder<EntityHeaderInterface>()
      .setHeader('entity', ctx.entity)
      .build();

    return this.txScope.run(ctx, async (trx) => {
      const expirationDate = this.expirationPolicy.resolveExpirationDate(
        dto.expiresIn,
      );

      const cache = this.eventPublisher.mergeObjectContext(
        Cache.create(eventContext, dto, expirationDate),
      );

      await cacheRepo.save(ctx, cache);

      trx.onCommit(ctx, () => cache.commit());
      trx.onRollback(ctx, () => cache.uncommit());

      return cache;
    });
  }
}
