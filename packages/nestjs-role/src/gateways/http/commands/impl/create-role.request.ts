import { RoleCreatableInterface, RoleInterface } from '@concepta/nestjs-common';
import { CrudCreateCommand } from '@concepta/nestjs-crud';

export class CreateRoleRequest extends CrudCreateCommand<
  RoleInterface,
  RoleCreatableInterface
> {}
