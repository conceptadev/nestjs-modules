import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TransactionScope } from '@concepta/nestjs-repository';

import { OtpHistoryCleanupService } from '../../../domain/services/otp-history-cleanup.service.js';
import { OtpSettingsInterface } from '../../../infrastructure/config/interfaces/otp-settings.interface.js';
import { OTP_MODULE_SETTINGS_TOKEN } from '../../../otp.constants.js';
import { ClearOtpHistoryCommand } from '../impl/clear-otp-history.command.js';

@CommandHandler(ClearOtpHistoryCommand)
export class ClearOtpHistoryHandler implements ICommandHandler<ClearOtpHistoryCommand> {
  constructor(
    private readonly txScope: TransactionScope,
    private readonly historyCleanup: OtpHistoryCleanupService,
    @Inject(OTP_MODULE_SETTINGS_TOKEN)
    private readonly settings: OtpSettingsInterface,
  ) {}

  async execute(command: ClearOtpHistoryCommand): Promise<void> {
    const { ctx, namespace, otp } = command;
    const { assigneeId, category } = otp;

    const keepHistoryDays =
      command.keepHistoryDays !== undefined
        ? command.keepHistoryDays
        : this.settings.keepHistoryDays;

    if (keepHistoryDays === undefined) return;

    return this.txScope.run(ctx, async (txCtx) => {
      await this.historyCleanup.cleanup(txCtx, {
        namespace,
        assigneeId,
        category,
        keepHistoryDays,
      });
    });
  }
}
