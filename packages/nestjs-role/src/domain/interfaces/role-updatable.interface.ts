import { type RoleInterface } from './role.interface.js';

export interface RoleUpdatableInterface extends Pick<
  RoleInterface,
  'name' | 'description'
> {}
