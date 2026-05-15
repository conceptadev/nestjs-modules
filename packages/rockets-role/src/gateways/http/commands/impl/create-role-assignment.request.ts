import { CrudCreateCommand } from '@concepta/rockets-crud';

import { RoleAssignmentCreatableInterface } from '../../../../domain/interfaces/role-assignment-creatable.interface';
import { RoleAssignmentEntityInterface } from '../../../../domain/interfaces/role-assignment-entity.interface';

export class CreateRoleAssignmentRequest extends CrudCreateCommand<
  RoleAssignmentEntityInterface,
  RoleAssignmentCreatableInterface
> {}
