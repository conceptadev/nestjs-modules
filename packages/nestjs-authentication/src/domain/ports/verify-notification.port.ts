import { Injectable, PlainLiteralObject, Type } from '@nestjs/common';
import { Command, CommandBus } from '@nestjs/cqrs';

import { ReferenceEmail } from '@concepta/nestjs-core';

import { AuthenticationEmailException } from '../exceptions/authentication-email.exception.js';

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
      .catch((err: unknown) => {
        throw new AuthenticationEmailException({ originalError: err });
      });
  }
}
