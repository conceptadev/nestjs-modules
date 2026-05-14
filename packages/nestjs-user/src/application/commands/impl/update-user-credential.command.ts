import { PlainLiteralObject } from '@nestjs/common';
import { Command } from '@nestjs/cqrs';

import { PasswordUpdateInterface } from '@concepta/nestjs-password';
import { ReferenceId } from '@concepta/rockets-app';

export class UpdateUserCredentialCommand extends Command<void> {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly userId: ReferenceId,
    public readonly passwordDto: PasswordUpdateInterface,
  ) {
    super();
  }
}
