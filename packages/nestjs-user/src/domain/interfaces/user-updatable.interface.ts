import { type UserCreatableInterface } from './user-creatable.interface';

export interface UserUpdatableInterface extends Partial<
  Pick<UserCreatableInterface, 'email' | 'active'>
> {}
