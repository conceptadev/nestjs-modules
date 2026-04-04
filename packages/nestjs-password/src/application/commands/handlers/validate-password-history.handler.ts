import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PasswordCreationService } from '../../../domain/services/password-creation.service';
import { ValidatePasswordHistoryCommand } from '../impl/validate-password-history.command';

@CommandHandler(ValidatePasswordHistoryCommand)
export class ValidatePasswordHistoryHandler
  implements ICommandHandler<ValidatePasswordHistoryCommand>
{
  constructor(
    private readonly passwordCreationService: PasswordCreationService,
  ) {}

  async execute(command: ValidatePasswordHistoryCommand): Promise<boolean> {
    const { password, targets } = command;
    return this.passwordCreationService.validateHistory({ password, targets });
  }
}
