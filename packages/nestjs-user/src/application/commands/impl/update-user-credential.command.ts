import { PlainLiteralObject } from '@nestjs/common';
import { Command } from '@nestjs/cqrs';

import { PasswordUpdateInterface, ReferenceId } from '@concepta/nestjs-common';

export class UpdateUserCredentialCommand extends Command<void> {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly userId: ReferenceId,
    public readonly passwordDto: PasswordUpdateInterface,
  ) {
    super();
  }
}
