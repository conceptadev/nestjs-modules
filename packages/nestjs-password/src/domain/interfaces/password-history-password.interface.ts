import {
  PasswordPlainInterface,
  PasswordStorageInterface,
} from '@concepta/nestjs-common';

export interface PasswordHistoryPasswordInterface
  extends PasswordPlainInterface {
  targets: PasswordStorageInterface[];
}
