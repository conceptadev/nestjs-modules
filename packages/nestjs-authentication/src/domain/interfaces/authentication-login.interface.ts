import { ReferenceUsernameInterface } from '@concepta/nestjs-core';
import { PasswordPlainInterface } from '@concepta/nestjs-password';

export interface AuthenticationLoginInterface
  extends ReferenceUsernameInterface, PasswordPlainInterface {}
