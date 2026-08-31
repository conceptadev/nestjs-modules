import { Injectable, PlainLiteralObject, Type } from '@nestjs/common';
import { Command, CommandBus, EventBus } from '@nestjs/cqrs';

import { ReferenceEmail } from '@concepta/nestjs-core';

import { NotificationSendFailedEvent } from '../events/notification-send-failed.event.js';

export interface SendRecoverLoginNotificationCommandInterface extends Command<void> {
  ctx: PlainLiteralObject;
  email: ReferenceEmail;
  username: string;
}

export interface SendRecoverPasswordNotificationCommandInterface extends Command<void> {
  ctx: PlainLiteralObject;
  email: ReferenceEmail;
  passcode: string;
  tokenExp: Date;
}

export interface SendPasswordUpdatedNotificationCommandInterface extends Command<void> {
  ctx: PlainLiteralObject;
  email: ReferenceEmail;
}

export interface RecoveryNotificationPortSettings {
  sendRecoverLoginNotificationCommand: Type<SendRecoverLoginNotificationCommandInterface>;
  sendRecoverPasswordNotificationCommand: Type<SendRecoverPasswordNotificationCommandInterface>;
  sendPasswordUpdatedNotificationCommand: Type<SendPasswordUpdatedNotificationCommandInterface>;
}

@Injectable()
export class RecoveryNotificationPort {
  constructor(
    private readonly portSettings: RecoveryNotificationPortSettings,
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus,
  ) {}

  sendRecoverLogin(
    ctx: PlainLiteralObject,
    email: ReferenceEmail,
    username: string,
  ): void {
    const command = this.portSettings.sendRecoverLoginNotificationCommand;
    void this.commandBus
      .execute(new command(ctx, email, username))
      // Fire-and-forget: a throw here would reject an unawaited promise and crash the process.
      .catch((error: unknown) =>
        this.eventBus.publish(
          new NotificationSendFailedEvent(ctx, email, command, error),
        ),
      );
  }

  sendRecoverPassword(
    ctx: PlainLiteralObject,
    email: ReferenceEmail,
    params: { passcode: string; tokenExp: Date },
  ): void {
    const command = this.portSettings.sendRecoverPasswordNotificationCommand;
    void this.commandBus
      .execute(new command(ctx, email, params.passcode, params.tokenExp))
      // Fire-and-forget: a throw here would reject an unawaited promise and crash the process.
      .catch((error: unknown) =>
        this.eventBus.publish(
          new NotificationSendFailedEvent(ctx, email, command, error),
        ),
      );
  }

  sendPasswordUpdated(ctx: PlainLiteralObject, email: ReferenceEmail): void {
    const command = this.portSettings.sendPasswordUpdatedNotificationCommand;
    void this.commandBus
      .execute(new command(ctx, email))
      // Fire-and-forget: a throw here would reject an unawaited promise and crash the process.
      .catch((error: unknown) =>
        this.eventBus.publish(
          new NotificationSendFailedEvent(ctx, email, command, error),
        ),
      );
  }
}
