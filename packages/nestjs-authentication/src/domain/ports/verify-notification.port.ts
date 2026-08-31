import { Injectable, PlainLiteralObject, Type } from '@nestjs/common';
import { Command, CommandBus } from '@nestjs/cqrs';

import { ReferenceEmail } from '@concepta/nestjs-core';

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
  ) {}

  sendVerify(
    ctx: PlainLiteralObject,
    email: ReferenceEmail,
    params: { passcode: string; tokenExp: Date },
  ): void {
    void this.commandBus
      .execute(
        new this.portSettings.sendVerifyNotificationCommand(
          ctx,
          email,
          params.passcode,
          params.tokenExp,
        ),
      )
      // Fire-and-forget: a throw here would reject an unawaited promise and crash the process.
      .catch(() => undefined);
  }
}
