import { ReferenceActiveInterface } from '@concepta/nestjs-core';
import { PasswordStorageInterface } from '@concepta/nestjs-password';

import { UserOwnableInterface } from './user-ownable.interface';

export interface UserCredentialInterface
  extends
    PasswordStorageInterface,
    UserOwnableInterface,
    ReferenceActiveInterface {
  validFrom: Date;
  validTo: Date | null;
}
