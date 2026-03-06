import { RoleAssignmentEntityInterface } from '@concepta/nestjs-common';
import { CrudDeleteCommand } from '@concepta/nestjs-crud';

export class DeleteRoleAssignmentRequest extends CrudDeleteCommand<RoleAssignmentEntityInterface> {}
