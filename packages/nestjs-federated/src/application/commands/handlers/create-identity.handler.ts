import { Inject } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';

import { EventContextHost } from '@concepta/nestjs-common';
import { TransactionScope } from '@concepta/nestjs-repository';

import { Identity } from '../../../domain/aggregates/identity';
import { IdentityRepositoryInterface } from '../../../domain/repositories/identity-repository.interface';
import { FEDERATED_MODULE_IDENTITY_REPOSITORY_TOKEN } from '../../../federated.constants';
import { CreateIdentityCommand } from '../impl/create-identity.command';

@CommandHandler(CreateIdentityCommand)
export class CreateIdentityHandler
  implements ICommandHandler<CreateIdentityCommand>
{
  constructor(
    @Inject(FEDERATED_MODULE_IDENTITY_REPOSITORY_TOKEN)
    private readonly identityRepo: IdentityRepositoryInterface,
    private readonly txScope: TransactionScope,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: CreateIdentityCommand): Promise<Identity> {
    const { ctx, dto } = command;

    return this.txScope.run(ctx, async (txCtx) => {
      const eventContext = new EventContextHost({}, {});

      const identity = this.eventPublisher.mergeObjectContext(
        Identity.create(eventContext, dto),
      );

      await this.identityRepo.save(txCtx, identity);

      txCtx.trx.onCommit(() => identity.commit());
      txCtx.trx.onRollback(() => identity.uncommit());

      return identity;
    });
  }
}
