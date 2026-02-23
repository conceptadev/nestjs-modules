import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';

import {
  EntityHeaderInterface,
  EventContextHost,
} from '@concepta/nestjs-common';
import { TransactionScope } from '@concepta/nestjs-repository';

import { OtpRepositoryResolver } from '../../../infrastructure/persistence/otp-repository.resolver';
import { DeactivateOtpCommand } from '../impl/deactivate-otp.command';

@CommandHandler(DeactivateOtpCommand)
export class DeactivateOtpHandler
  implements ICommandHandler<DeactivateOtpCommand>
{
  constructor(
    private readonly repositoryResolver: OtpRepositoryResolver,
    private readonly txScope: TransactionScope,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: DeactivateOtpCommand): Promise<void> {
    const { ctx, otp } = command;

    const otpRepo = this.repositoryResolver.resolve(ctx.entity);

    return this.txScope.run(ctx, async (trx) => {
      const activeOtp = await otpRepo.findActiveByAssignee(ctx, {
        assigneeId: otp.assigneeId,
        category: otp.category,
      });

      if (activeOtp) {
        const eventContext = EventContextHost.builder<EntityHeaderInterface>()
          .setHeader('entity', ctx.entity)
          .build();

        const aggregate = this.eventPublisher.mergeObjectContext(activeOtp);
        aggregate.deactivate(eventContext);
        await otpRepo.save(ctx, aggregate);

        trx.onCommit(ctx, () => aggregate.commit());
        trx.onRollback(ctx, () => aggregate.uncommit());
      }
    });
  }
}
