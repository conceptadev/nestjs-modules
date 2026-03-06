import { RoleCreatableInterface, RoleInterface } from '@concepta/nestjs-common';
import { CrudReplaceCommand } from '@concepta/nestjs-crud';

export class ReplaceRoleRequest extends CrudReplaceCommand<
  RoleInterface,
  RoleCreatableInterface
> {}
