import { ReferenceUsernameInterface } from '@concepta/rockets-app';
import { PasswordPlainInterface } from '@concepta/rockets-password';

export interface AuthenticationLoginInterface
  extends ReferenceUsernameInterface,
    PasswordPlainInterface {}
