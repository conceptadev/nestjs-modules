import { CrudUpdateCommand } from '@concepta/rockets-crud';

import { RoleUpdatableInterface } from '../../../../domain/interfaces/role-updatable.interface';
import { RoleInterface } from '../../../../domain/interfaces/role.interface';

export class UpdateRoleRequest extends CrudUpdateCommand<
  RoleInterface,
  RoleUpdatableInterface
> {}
