import { CrudReplaceCommand } from '@concepta/nestjs-crud';

import { type RoleCreatableInterface } from '../../../../domain/interfaces/role-creatable.interface';
import { type RoleInterface } from '../../../../domain/interfaces/role.interface';

export class ReplaceRoleRequest extends CrudReplaceCommand<
  RoleInterface,
  RoleCreatableInterface
> {}
