import { RoleAssignmentEntityInterface } from '@concepta/nestjs-common';
import { CrudReadQuery } from '@concepta/nestjs-crud';

export class ReadRoleAssignmentRequest extends CrudReadQuery<RoleAssignmentEntityInterface> {}
