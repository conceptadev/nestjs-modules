import { Inject } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';

import {
  AssigneeRelationInterface,
  EntityHeaderInterface,
  EventContextHost,
} from '@concepta/nestjs-common';
import { TransactionScope } from '@concepta/nestjs-repository';

import { OtpTypeNotDefinedException } from '../../../domain/exceptions/otp-type-not-defined.exception';
import { OtpSettingsInterface } from '../../../infrastructure/config/interfaces/otp-settings.interface';
import { OtpRepositoryResolver } from '../../../infrastructure/persistence/otp-repository.resolver';
import { OTP_MODULE_SETTINGS_TOKEN } from '../../../otp.constants';
import { ConsumeOtpCommand } from '../impl/consume-otp.command';

@CommandHandler(ConsumeOtpCommand)
export class ConsumeOtpHandler
  implements
    ICommandHandler<ConsumeOtpCommand, AssigneeRelationInterface | null>
{
  constructor(
    private readonly repositoryResolver: OtpRepositoryResolver,
    private readonly txScope: TransactionScope,
    private readonly eventPublisher: EventPublisher,
    @Inject(OTP_MODULE_SETTINGS_TOKEN)
    private readonly settings: OtpSettingsInterface,
  ) {}

  async execute(
    command: ConsumeOtpCommand,
  ): Promise<AssigneeRelationInterface | null> {
    const { ctx, otp } = command;
    const { category, passcode } = otp;

    const otpRepo = this.repositoryResolver.resolve(ctx.entity);

    let result: AssigneeRelationInterface | null = null;

    await this.txScope.run(ctx, async (trx) => {
      const activeOtp = await otpRepo.findActiveByPasscode(ctx, {
        category,
        passcode,
      });

      if (!activeOtp || activeOtp.isExpired()) {
        return;
      }

      const { type } = activeOtp;
      const typeConfig = this.settings.types[type];

      if (!typeConfig) {
        throw new OtpTypeNotDefinedException(type);
      }

      if (!typeConfig.validator(passcode, activeOtp.passcode)) {
        return;
      }

      const eventContext = EventContextHost.builder<EntityHeaderInterface>()
        .setHeader('entity', ctx.entity)
        .build();

      this.eventPublisher.mergeObjectContext(activeOtp);

      activeOtp.consume(eventContext);

      await otpRepo.remove(ctx, activeOtp);

      trx.onCommit(ctx, () => activeOtp.commit());
      trx.onRollback(ctx, () => activeOtp.uncommit());

      result = { assigneeId: activeOtp.assigneeId };
    });

    return result;
  }
}
