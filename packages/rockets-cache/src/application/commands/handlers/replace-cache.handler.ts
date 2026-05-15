import { Inject } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';

import { EventContextHost } from '@concepta/rockets-app';
import { TransactionScope } from '@concepta/rockets-repository';

import { CACHE_REPOSITORY_RESOLVER_TOKEN } from '../../../cache.constants';
import { Cache } from '../../../domain/aggregates/cache';
import { CacheExpirationPolicy } from '../../../domain/policies/cache-expiration.policy';
import { CacheRepositoryResolverInterface } from '../../../domain/repositories/cache-repository-resolver.interface';
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
    private readonly expirationPolicy: CacheExpirationPolicy,
  ) {}

  async execute(command: ReplaceCacheCommand): Promise<Cache> {
    const { ctx, namespace, id, dto } = command;
    const cacheRepo = this.repositoryResolver.resolve(namespace);

    const eventContext = new EventContextHost({ namespace }, {});

    return this.txScope.run(ctx, async (txCtx) => {
      const expirationDate = this.expirationPolicy.resolveExpirationDate(
        dto.expiresIn,
      );

      let cache: Cache;

      const existing = await cacheRepo.get(txCtx, id);

      if (existing) {
        cache = this.eventPublisher.mergeObjectContext(existing);
        cache.replace(eventContext, dto, expirationDate);
      } else {
        cache = this.eventPublisher.mergeObjectContext(
          Cache.createWithId(eventContext, id, dto, expirationDate),
        );
      }

      await cacheRepo.save(txCtx, cache);

      txCtx.trx.onCommit(() => cache.commit());
      txCtx.trx.onRollback(() => cache.uncommit());

      return cache;
    });
  }
}
