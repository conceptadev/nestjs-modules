import { type UserCredentialInterface } from '../../interfaces/user-credential.interface';

export interface UserCredentialsEventPayloadInterface extends Omit<
  UserCredentialInterface,
  'passwordHash'
> {}
