import { Inject } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';

import {
  AssigneeRelationInterface,
  EventContextHost,
} from '@concepta/nestjs-core';
import { TransactionScope } from '@concepta/nestjs-repository';

import { OtpTypeNotDefinedException } from '../../../domain/exceptions/otp-type-not-defined.exception';
import { OtpRepositoryResolverInterface } from '../../../domain/repositories/otp-repository-resolver.interface';
import { OtpSettingsInterface } from '../../../infrastructure/config/interfaces/otp-settings.interface';
import {
  OTP_MODULE_SETTINGS_TOKEN,
  OTP_REPOSITORY_RESOLVER_TOKEN,
} from '../../../otp.constants';
import { ConsumeOtpCommand } from '../impl/consume-otp.command';

@CommandHandler(ConsumeOtpCommand)
export class ConsumeOtpHandler implements ICommandHandler<
  ConsumeOtpCommand,
  AssigneeRelationInterface | null
> {
  constructor(
    @Inject(OTP_REPOSITORY_RESOLVER_TOKEN)
    private readonly repositoryResolver: OtpRepositoryResolverInterface,
    private readonly txScope: TransactionScope,
    private readonly eventPublisher: EventPublisher,
    @Inject(OTP_MODULE_SETTINGS_TOKEN)
    private readonly settings: OtpSettingsInterface,
  ) {}

  async execute(
    command: ConsumeOtpCommand,
  ): Promise<AssigneeRelationInterface | null> {
    const { ctx, namespace, otp } = command;
    const { category, passcode } = otp;

    const otpRepo = this.repositoryResolver.resolve(namespace);

    let result: AssigneeRelationInterface | null = null;

    await this.txScope.run(ctx, async (txCtx) => {
      const activeOtp = await otpRepo.findActiveByPasscode(txCtx, {
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

      const eventContext = new EventContextHost({ namespace }, {});

      this.eventPublisher.mergeObjectContext(activeOtp);

      activeOtp.consume(eventContext);

      await otpRepo.remove(txCtx, activeOtp);

      txCtx.trx.onCommit(() => activeOtp.commit());
      txCtx.trx.onRollback(() => activeOtp.uncommit());

      result = { assigneeId: activeOtp.assigneeId };
    });

    return result;
  }
}
