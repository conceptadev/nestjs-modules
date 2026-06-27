import { type PasswordPlainInterface } from '../password/interfaces/password-plain.interface';
import { type PasswordStorageInterface } from '../password/interfaces/password-storage.interface';

export interface PasswordCurrentPasswordInterface extends PasswordPlainInterface {
  target: PasswordStorageInterface;
}
