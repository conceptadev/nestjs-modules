import {
  PasswordPlainInterface,
  PasswordStorageInterface,
} from '@concepta/nestjs-common';

export interface PasswordValidateOptionsInterface
  extends PasswordPlainInterface,
    PasswordStorageInterface {}
