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
import { CacheNotFoundException } from '../../exceptions/cache-not-found.exception';
import { UpdateCacheCommand } from '../impl/update-cache.command';

@CommandHandler(UpdateCacheCommand)
export class UpdateCacheHandler implements ICommandHandler<UpdateCacheCommand> {
  constructor(
    @Inject(CACHE_REPOSITORY_RESOLVER_TOKEN)
    private readonly repositoryResolver: CacheRepositoryResolverInterface,
    private readonly txScope: TransactionScope,
    private readonly eventPublisher: EventPublisher,
    private readonly expirationPolicy: CacheExpirationPolicy,
  ) {}

  async execute(command: UpdateCacheCommand): Promise<Cache> {
    const { ctx, id, dto } = command;
    const { data, expiresIn } = dto;

    const cacheRepo = this.repositoryResolver.resolve(ctx.entity);

    const eventContext = EventContextHost.builder<EntityHeaderInterface>()
      .setHeader('entity', ctx.entity)
      .build();

    return this.txScope.run(ctx, async (trx) => {
      const existing = await cacheRepo.get(ctx, id);

      if (!existing) {
        throw new CacheNotFoundException(id);
      }

      const cache = this.eventPublisher.mergeObjectContext(existing);

      cache.updateData(eventContext, data);

      if (expiresIn) {
        const expirationDate =
          this.expirationPolicy.resolveExpirationDate(expiresIn);
        cache.extend(eventContext, expirationDate);
      }

      await cacheRepo.save(ctx, cache);

      trx.onCommit(ctx, () => cache.commit());
      trx.onRollback(ctx, () => cache.uncommit());

      return cache;
    });
  }
}
