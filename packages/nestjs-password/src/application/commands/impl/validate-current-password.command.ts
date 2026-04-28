import { Command } from '@nestjs/cqrs';

import { PasswordStorageInterface } from '@concepta/nestjs-common';

export class ValidateCurrentPasswordCommand extends Command<boolean> {
  constructor(
    public readonly password: string,
    public readonly target: PasswordStorageInterface,
  ) {
    super();
  }
}
