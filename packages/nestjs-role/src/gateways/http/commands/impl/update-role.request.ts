import { CrudUpdateCommand } from '@concepta/nestjs-crud';

import { type RoleUpdatableInterface } from '../../../../domain/interfaces/role-updatable.interface';
import { type RoleInterface } from '../../../../domain/interfaces/role.interface';

export class UpdateRoleRequest extends CrudUpdateCommand<
  RoleInterface,
  RoleUpdatableInterface
> {}
