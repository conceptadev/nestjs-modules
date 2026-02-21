import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TransactionScope } from '@concepta/nestjs-repository';

import { CacheRepositoryResolver } from '../../../infrastructure/persistence/cache-repository.resolver';
import { ClearCachesByAssigneeCommand } from '../impl/clear-caches-by-assignee.command';

@CommandHandler(ClearCachesByAssigneeCommand)
export class ClearCachesByAssigneeHandler
  implements ICommandHandler<ClearCachesByAssigneeCommand>
{
  constructor(
    private readonly repositoryResolver: CacheRepositoryResolver,
    private readonly txScope: TransactionScope,
  ) {}

  async execute(command: ClearCachesByAssigneeCommand): Promise<void> {
    const { ctx, assigneeId } = command;

    const cacheRepo = this.repositoryResolver.resolve(ctx.entity);

    return this.txScope.run(ctx, async () => {
      await cacheRepo.removeAllByAssignee({ assigneeId, ctx });
    });
  }
}
