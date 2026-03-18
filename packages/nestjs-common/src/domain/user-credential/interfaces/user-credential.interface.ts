import { ReferenceActiveInterface } from '../../../reference/interfaces/reference-active.interface';
import { PasswordStorageInterface } from '../../password/interfaces/password-storage.interface';
import { UserOwnableInterface } from '../../user/interfaces/user-ownable.interface';

export interface UserCredentialInterface
  extends PasswordStorageInterface,
    UserOwnableInterface,
    ReferenceActiveInterface {
  validFrom: Date;
  validTo: Date | null;
}
