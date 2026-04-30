import { ReferenceUsernameInterface } from '@concepta/nestjs-common';
import { PasswordPlainInterface } from '@concepta/nestjs-password';

export interface AuthenticationLoginInterface
  extends ReferenceUsernameInterface,
    PasswordPlainInterface {}
