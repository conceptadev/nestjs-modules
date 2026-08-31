import { Injectable, PlainLiteralObject, Type } from '@nestjs/common';
import { Command, CommandBus } from '@nestjs/cqrs';

import { ReferenceEmail } from '@concepta/nestjs-core';

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
  ) {}

  sendRecoverLogin(
    ctx: PlainLiteralObject,
    email: ReferenceEmail,
    username: string,
  ): void {
    void this.commandBus
      .execute(
        new this.portSettings.sendRecoverLoginNotificationCommand(
          ctx,
          email,
          username,
        ),
      )
      // Fire-and-forget: a throw here would reject an unawaited promise and crash the process.
      .catch(() => undefined);
  }

  sendRecoverPassword(
    ctx: PlainLiteralObject,
    email: ReferenceEmail,
    params: { passcode: string; tokenExp: Date },
  ): void {
    void this.commandBus
      .execute(
        new this.portSettings.sendRecoverPasswordNotificationCommand(
          ctx,
          email,
          params.passcode,
          params.tokenExp,
        ),
      )
      // Fire-and-forget: a throw here would reject an unawaited promise and crash the process.
      .catch(() => undefined);
  }

  sendPasswordUpdated(ctx: PlainLiteralObject, email: ReferenceEmail): void {
    void this.commandBus
      .execute(
        new this.portSettings.sendPasswordUpdatedNotificationCommand(
          ctx,
          email,
        ),
      )
      // Fire-and-forget: a throw here would reject an unawaited promise and crash the process.
      .catch(() => undefined);
  }
}
