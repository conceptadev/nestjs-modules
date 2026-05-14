import { PasswordStorageInterface } from '@concepta/nestjs-password';
import {
  ReferenceActiveInterface,
  ReferenceIdInterface,
  ReferenceUsernameInterface,
} from '@concepta/rockets-app';

export interface LocalCredentialsInterface
  extends ReferenceIdInterface,
    ReferenceUsernameInterface,
    ReferenceActiveInterface,
    PasswordStorageInterface {}
