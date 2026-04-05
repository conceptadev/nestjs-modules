import { CrudReplaceCommand } from '@concepta/nestjs-crud';

import { RoleCreatableInterface } from '../../../../domain/interfaces/role-creatable.interface';
import { RoleInterface } from '../../../../domain/interfaces/role.interface';

export class ReplaceRoleRequest extends CrudReplaceCommand<
  RoleInterface,
  RoleCreatableInterface
> {}
