import { Command } from '@nestjs/cqrs';

import { PasswordStorageInterface } from '@concepta/nestjs-common';

export class ValidatePasswordHistoryCommand extends Command<boolean> {
  constructor(
    public readonly password: string,
    public readonly targets: PasswordStorageInterface[],
  ) {
    super();
  }
}
