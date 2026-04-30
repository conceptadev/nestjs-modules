import { PasswordPlainInterface } from '../password/interfaces/password-plain.interface';
import { PasswordStorageInterface } from '../password/interfaces/password-storage.interface';

export interface PasswordValidateOptionsInterface
  extends PasswordPlainInterface,
    PasswordStorageInterface {}
