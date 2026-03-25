import { Inject } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';

import { EventContextHost } from '@concepta/nestjs-common';
import { TransactionScope } from '@concepta/nestjs-repository';
import { OtpRepositoryResolverInterface } from '../../../domain/repositories/otp-repository-resolver.interface';
import { OTP_REPOSITORY_RESOLVER_TOKEN } from '../../../otp.constants';
import { DeactivateOtpCommand } from '../impl/deactivate-otp.command';

@CommandHandler(DeactivateOtpCommand)
export class DeactivateOtpHandler
  implements ICommandHandler<DeactivateOtpCommand>
{
  constructor(
    @Inject(OTP_REPOSITORY_RESOLVER_TOKEN)
    private readonly repositoryResolver: OtpRepositoryResolverInterface,
    private readonly txScope: TransactionScope,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: DeactivateOtpCommand): Promise<void> {
    const { ctx, namespace, otp } = command;

    const otpRepo = this.repositoryResolver.resolve(namespace);

    return this.txScope.run(ctx, async (trx) => {
      const activeOtp = await otpRepo.findActiveByAssignee(ctx, {
        assigneeId: otp.assigneeId,
        category: otp.category,
      });

      if (activeOtp) {
        const eventContext = new EventContextHost({ namespace }, {});

        const aggregate = this.eventPublisher.mergeObjectContext(activeOtp);
        aggregate.deactivate(eventContext);
        await otpRepo.save(ctx, aggregate);

        trx.onCommit(ctx, () => aggregate.commit());
        trx.onRollback(ctx, () => aggregate.uncommit());
      }
    });
  }
}
