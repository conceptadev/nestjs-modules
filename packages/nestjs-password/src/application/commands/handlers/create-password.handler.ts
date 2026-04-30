import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PasswordStorageInterface } from '../../../domain/password/interfaces/password-storage.interface';
import { PasswordCreationService } from '../../../domain/services/password-creation.service';
import { CreatePasswordCommand } from '../impl/create-password.command';

@CommandHandler(CreatePasswordCommand)
export class CreatePasswordHandler
  implements ICommandHandler<CreatePasswordCommand>
{
  constructor(
    private readonly passwordCreationService: PasswordCreationService,
  ) {}

  async execute(
    command: CreatePasswordCommand,
  ): Promise<PasswordStorageInterface> {
    return this.passwordCreationService.create(command.password);
  }
}
