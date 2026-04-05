import { RoleInterface } from './role.interface';

export interface RoleUpdatableInterface
  extends Pick<RoleInterface, 'name' | 'description'> {}
