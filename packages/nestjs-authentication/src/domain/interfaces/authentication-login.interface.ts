import {
  PasswordPlainInterface,
  ReferenceUsernameInterface,
} from '@concepta/nestjs-common';

export interface AuthenticationLoginInterface
  extends ReferenceUsernameInterface,
    PasswordPlainInterface {}
