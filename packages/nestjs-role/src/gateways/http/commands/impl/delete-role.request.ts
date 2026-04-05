import { CrudDeleteCommand } from '@concepta/nestjs-crud';

import { RoleInterface } from '../../../../domain/interfaces/role.interface';

export class DeleteRoleRequest extends CrudDeleteCommand<RoleInterface> {}
