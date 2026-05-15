import {
  ReferenceActiveInterface,
  ReferenceIdInterface,
  ReferenceUsernameInterface,
} from '@concepta/rockets-app';
import { PasswordStorageInterface } from '@concepta/rockets-password';

export interface LocalCredentialsInterface
  extends ReferenceIdInterface,
    ReferenceUsernameInterface,
    ReferenceActiveInterface,
    PasswordStorageInterface {}
