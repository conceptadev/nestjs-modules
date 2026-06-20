import { Command } from '@nestjs/cqrs';

import { PasswordValidateOptionsInterface } from '../../../domain/interfaces/password-validate-options.interface';

export class ValidatePasswordCommand extends Command<boolean> {
  constructor(public readonly options: PasswordValidateOptionsInterface) {
    super();
  }
}
