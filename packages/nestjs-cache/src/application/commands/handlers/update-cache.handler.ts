import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';

import {
  EntityHeaderInterface,
  EventContextHost,
} from '@concepta/nestjs-common';
import { TransactionScope } from '@concepta/nestjs-repository';

import { Cache } from '../../../domain/aggregates/cache';
import { CacheRepositoryResolver } from '../../../infrastructure/persistence/cache-repository.resolver';
import { CacheNotFoundException } from '../../exceptions/cache-not-found.exception';
import { UpdateCacheCommand } from '../impl/update-cache.command';

@CommandHandler(UpdateCacheCommand)
export class UpdateCacheHandler implements ICommandHandler<UpdateCacheCommand> {
  constructor(
    private readonly repositoryResolver: CacheRepositoryResolver,
    private readonly txScope: TransactionScope,
    private readonly eventPublisher: EventPublisher,
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
        cache.extend(eventContext, expiresIn);
      }

      await cacheRepo.save(ctx, cache);

      trx.onCommit(ctx, () => cache.commit());
      trx.onRollback(ctx, () => cache.uncommit());

      return cache;
    });
  }
}
