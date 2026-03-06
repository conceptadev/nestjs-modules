import { RoleInterface } from '@concepta/nestjs-common';
import { CrudDeleteCommand } from '@concepta/nestjs-crud';

export class DeleteRoleRequest extends CrudDeleteCommand<RoleInterface> {}
