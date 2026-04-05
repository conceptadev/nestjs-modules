import {
  ReferenceActiveInterface,
  PasswordStorageInterface,
} from '@concepta/nestjs-common';

import { UserOwnableInterface } from './user-ownable.interface';

export interface UserCredentialInterface
  extends PasswordStorageInterface,
    UserOwnableInterface,
    ReferenceActiveInterface {
  validFrom: Date;
  validTo: Date | null;
}
