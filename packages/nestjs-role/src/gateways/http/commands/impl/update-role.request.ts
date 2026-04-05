import { CrudUpdateCommand } from '@concepta/nestjs-crud';

import { RoleUpdatableInterface } from '../../../../domain/interfaces/role-updatable.interface';
import { RoleInterface } from '../../../../domain/interfaces/role.interface';

export class UpdateRoleRequest extends CrudUpdateCommand<
  RoleInterface,
  RoleUpdatableInterface
> {}
