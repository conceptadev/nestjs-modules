import { UserCredentialInterface } from './user-credential.interface';

export interface UserCredentialCreatableInterface
  extends Pick<
    UserCredentialInterface,
    'userId' | 'passwordHash' | 'passwordSalt'
  > {}
