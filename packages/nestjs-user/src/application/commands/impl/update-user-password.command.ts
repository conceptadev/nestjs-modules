import { PlainLiteralObject } from '@nestjs/common';
import { Command } from '@nestjs/cqrs';

import { ReferenceId } from '@concepta/nestjs-common';
import { PasswordUpdateInterface } from '@concepta/nestjs-password';

export class UpdateUserPasswordCommand extends Command<void> {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly userId: ReferenceId,
    public readonly passwordDto: PasswordUpdateInterface,
  ) {
    super();
  }
}
