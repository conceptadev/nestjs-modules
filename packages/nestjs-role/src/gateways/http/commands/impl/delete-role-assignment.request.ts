import { CrudDeleteCommand } from '@concepta/nestjs-crud';

import { type RoleAssignmentEntityInterface } from '../../../../domain/interfaces/role-assignment-entity.interface';

export class DeleteRoleAssignmentRequest extends CrudDeleteCommand<RoleAssignmentEntityInterface> {}
