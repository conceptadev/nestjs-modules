import { IdentityInterface } from './identity.interface';

export interface IdentityCreatableInterface extends Pick<
  IdentityInterface,
  'provider' | 'subject' | 'user'
> {}
