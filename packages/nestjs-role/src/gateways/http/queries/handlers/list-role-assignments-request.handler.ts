import { RoleAssignmentEntityInterface } from '@concepta/nestjs-common';
import { CrudListHandler } from '@concepta/nestjs-crud';

export class ListRoleAssignmentsRequestHandler extends CrudListHandler<RoleAssignmentEntityInterface> {}
