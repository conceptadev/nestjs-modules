import { PasswordValidateOptionsInterface } from '../../../domain/interfaces/password-validate-options.interface';

export class ValidatePasswordCommand {
  constructor(public readonly options: PasswordValidateOptionsInterface) {}
}
