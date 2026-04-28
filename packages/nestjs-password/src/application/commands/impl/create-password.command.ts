import { Command } from '@nestjs/cqrs';

import { PasswordStorageInterface } from '@concepta/nestjs-common';

export class CreatePasswordCommand extends Command<PasswordStorageInterface> {
  constructor(public readonly password: string) {
    super();
  }
}
