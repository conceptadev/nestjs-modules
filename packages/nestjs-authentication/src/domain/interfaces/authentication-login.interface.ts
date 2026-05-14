import { PasswordPlainInterface } from '@concepta/nestjs-password';
import { ReferenceUsernameInterface } from '@concepta/rockets-app';

export interface AuthenticationLoginInterface
  extends ReferenceUsernameInterface,
    PasswordPlainInterface {}
