import { PasswordStorageInterface } from '@concepta/nestjs-password';
import { ReferenceActiveInterface } from '@concepta/rockets-app';

import { UserOwnableInterface } from './user-ownable.interface';

export interface UserCredentialInterface
  extends PasswordStorageInterface,
    UserOwnableInterface,
    ReferenceActiveInterface {
  validFrom: Date;
  validTo: Date | null;
}
