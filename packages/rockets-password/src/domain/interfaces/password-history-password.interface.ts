import { PasswordPlainInterface } from '../password/interfaces/password-plain.interface';
import { PasswordStorageInterface } from '../password/interfaces/password-storage.interface';

export interface PasswordHistoryPasswordInterface
  extends PasswordPlainInterface {
  targets: PasswordStorageInterface[];
}
