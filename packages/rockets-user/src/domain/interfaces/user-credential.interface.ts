import { ReferenceActiveInterface } from '@concepta/rockets-app';
import { PasswordStorageInterface } from '@concepta/rockets-password';

import { UserOwnableInterface } from './user-ownable.interface';

export interface UserCredentialInterface
  extends PasswordStorageInterface,
    UserOwnableInterface,
    ReferenceActiveInterface {
  validFrom: Date;
  validTo: Date | null;
}
