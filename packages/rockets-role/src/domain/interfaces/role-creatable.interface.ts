import { RoleInterface } from './role.interface';

export interface RoleCreatableInterface
  extends Pick<RoleInterface, 'name' | 'description'> {}
