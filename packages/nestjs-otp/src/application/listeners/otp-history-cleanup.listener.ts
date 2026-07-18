import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { AppContextHost } from '@concepta/nestjs-core';
import { TransactionScope } from '@concepta/nestjs-repository';

import { OtpCreatedEvent } from '../../domain/events/otp-created.event.js';
import { OtpHistoryCleanupService } from '../../domain/services/otp-history-cleanup.service.js';
import { OtpSettingsInterface } from '../../infrastructure/config/interfaces/otp-settings.interface.js';
import { OTP_MODULE_SETTINGS_TOKEN } from '../../otp.constants.js';

@EventsHandler(OtpCreatedEvent)
export class OtpHistoryCleanupListener implements IEventHandler<OtpCreatedEvent> {
  constructor(
    private readonly txScope: TransactionScope,
    private readonly historyCleanup: OtpHistoryCleanupService,
    @Inject(OTP_MODULE_SETTINGS_TOKEN)
    private readonly settings: OtpSettingsInterface,
  ) {}

  async handle(event: OtpCreatedEvent): Promise<void> {
    const {
      eventContext,
      otp: { assigneeId, category },
    } = event;
    const { namespace } = eventContext.headers;
    const { keepHistoryDays } = this.settings;

    if (keepHistoryDays === undefined) return;

    const appCtx = new AppContextHost();

    await this.txScope.run(appCtx, async (txCtx) => {
      await this.historyCleanup.cleanup(txCtx, {
        namespace,
        assigneeId,
        category,
        keepHistoryDays,
      });
    });
  }
}
