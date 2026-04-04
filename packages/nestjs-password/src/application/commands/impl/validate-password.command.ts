import { PasswordValidateOptionsInterface } from '../../../interfaces/password-validate-options.interface';

export class ValidatePasswordCommand {
  constructor(public readonly options: PasswordValidateOptionsInterface) {}
}
