import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';

import { TransactionScope } from '@concepta/nestjs-repository';

import { Cache } from '../../../domain/aggregates/cache';
import { CacheRepositoryResolver } from '../../../infrastructure/persistence/cache-repository.resolver';
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

    return this.txScope.run(ctx, async (trx) => {
      const cache = this.eventPublisher.mergeObjectContext(
        await cacheRepo.get({ id, ctx }),
      );

      cache.updateData(data);

      if (expiresIn) {
        cache.extend(expiresIn);
      }

      await cacheRepo.save({ cache, ctx });

      trx.onCommit(ctx, () => cache.commit());
      trx.onRollback(ctx, () => cache.uncommit());

      return cache;
    });
  }
}
