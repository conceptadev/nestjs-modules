import {
  ReferenceActiveInterface,
  ReferenceIdInterface,
  ReferenceUsernameInterface,
} from '@concepta/nestjs-core';
import { PasswordStorageInterface } from '@concepta/nestjs-password';

export interface LocalCredentialsInterface
  extends
    ReferenceIdInterface,
    ReferenceUsernameInterface,
    ReferenceActiveInterface,
    PasswordStorageInterface {}
