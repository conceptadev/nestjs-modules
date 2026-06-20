import { Inject } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';

import { EventContextHost } from '@concepta/nestjs-core';
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
    const { ctx, namespace, dto } = command;
    const cacheRepo = this.repositoryResolver.resolve(namespace);

    const eventContext = new EventContextHost({ namespace }, {});

    return this.txScope.run(ctx, async (txCtx) => {
      const expirationDate = this.expirationPolicy.resolveExpirationDate(
        dto.expiresIn,
      );

      const cache = this.eventPublisher.mergeObjectContext(
        Cache.create(eventContext, dto, expirationDate),
      );

      await cacheRepo.save(txCtx, cache);

      txCtx.trx.onCommit(() => cache.commit());
      txCtx.trx.onRollback(() => cache.uncommit());

      return cache;
    });
  }
}
