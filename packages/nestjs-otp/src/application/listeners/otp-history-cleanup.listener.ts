import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import {
  AppContextHost,
  RepositoryContextInterface,
} from '@concepta/nestjs-common';
import { TransactionScope } from '@concepta/nestjs-repository';

import { OtpCreatedEvent } from '../../domain/events/otp-created.event';
import { OtpHistoryCleanupService } from '../../domain/services/otp-history-cleanup.service';
import { OtpSettingsInterface } from '../../infrastructure/config/interfaces/otp-settings.interface';
import { OTP_MODULE_SETTINGS_TOKEN } from '../../otp.constants';

@EventsHandler(OtpCreatedEvent)
export class OtpHistoryCleanupListener
  implements IEventHandler<OtpCreatedEvent>
{
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
    const { keepHistoryDays } = this.settings;

    if (keepHistoryDays === undefined) return;

    const ctx = AppContextHost.merge<RepositoryContextInterface>(
      () => eventContext.headers,
    );

    await this.txScope.run(ctx, async () => {
      await this.historyCleanup.cleanup(ctx, {
        assigneeId,
        category,
        keepHistoryDays,
      });
    });
  }
}
