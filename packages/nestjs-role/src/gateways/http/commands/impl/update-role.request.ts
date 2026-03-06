import { RoleInterface, RoleUpdatableInterface } from '@concepta/nestjs-common';
import { CrudUpdateCommand } from '@concepta/nestjs-crud';

export class UpdateRoleRequest extends CrudUpdateCommand<
  RoleInterface,
  RoleUpdatableInterface
> {}
