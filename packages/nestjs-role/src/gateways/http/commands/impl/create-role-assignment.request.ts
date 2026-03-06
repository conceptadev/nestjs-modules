import {
  RoleAssignmentCreatableInterface,
  RoleAssignmentEntityInterface,
} from '@concepta/nestjs-common';
import { CrudCreateCommand } from '@concepta/nestjs-crud';

export class CreateRoleAssignmentRequest extends CrudCreateCommand<
  RoleAssignmentEntityInterface,
  RoleAssignmentCreatableInterface
> {}
