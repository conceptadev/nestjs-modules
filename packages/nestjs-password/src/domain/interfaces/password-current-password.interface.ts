import {
  PasswordPlainInterface,
  PasswordStorageInterface,
} from '@concepta/nestjs-common';

export interface PasswordCurrentPasswordInterface
  extends PasswordPlainInterface {
  target: PasswordStorageInterface;
}
