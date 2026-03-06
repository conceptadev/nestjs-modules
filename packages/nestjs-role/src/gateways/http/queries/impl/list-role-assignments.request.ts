import { RoleAssignmentEntityInterface } from '@concepta/nestjs-common';
import { CrudListQuery } from '@concepta/nestjs-crud';

export class ListRoleAssignmentsRequest extends CrudListQuery<RoleAssignmentEntityInterface> {}
