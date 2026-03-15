import { UserCredentialInterface } from '@concepta/nestjs-common';

export interface UserCredentialsEventPayloadInterface
  extends Omit<UserCredentialInterface, 'passwordHash' | 'passwordSalt'> {}
