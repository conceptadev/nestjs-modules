import { Injectable, PlainLiteralObject, Type } from '@nestjs/common';
import { Command, CommandBus, EventBus } from '@nestjs/cqrs';

import { ReferenceEmail } from '@concepta/nestjs-core';

import { NotificationSendFailedEvent } from '../events/notification-send-failed.event.js';

export interface SendVerifyNotificationCommandInterface extends Command<void> {
  ctx: PlainLiteralObject;
  email: ReferenceEmail;
  passcode: string;
  tokenExp: Date;
}

export interface VerifyNotificationPortSettings {
  sendVerifyNotificationCommand: Type<SendVerifyNotificationCommandInterface>;
}

@Injectable()
export class VerifyNotificationPort {
  constructor(
    private readonly portSettings: VerifyNotificationPortSettings,
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus,
  ) {}

  sendVerify(
    ctx: PlainLiteralObject,
    email: ReferenceEmail,
    params: { passcode: string; tokenExp: Date },
  ): void {
    const command = this.portSettings.sendVerifyNotificationCommand;
    void this.commandBus
      .execute(new command(ctx, email, params.passcode, params.tokenExp))
      // Fire-and-forget: a throw here would reject an unawaited promise and crash the process.
      .catch((error: unknown) =>
        this.eventBus.publish(
          new NotificationSendFailedEvent(ctx, email, command, error),
        ),
      );
  }
}
