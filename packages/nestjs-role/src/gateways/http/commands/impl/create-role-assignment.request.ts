import { CrudCreateCommand } from '@concepta/nestjs-crud';

import { type RoleAssignmentCreatableInterface } from '../../../../domain/interfaces/role-assignment-creatable.interface';
import { type RoleAssignmentEntityInterface } from '../../../../domain/interfaces/role-assignment-entity.interface';

export class CreateRoleAssignmentRequest extends CrudCreateCommand<
  RoleAssignmentEntityInterface,
  RoleAssignmentCreatableInterface
> {}
