import { CrudDeleteCommand } from '@concepta/rockets-crud';

import { RoleInterface } from '../../../../domain/interfaces/role.interface';

export class DeleteRoleRequest extends CrudDeleteCommand<RoleInterface> {}
