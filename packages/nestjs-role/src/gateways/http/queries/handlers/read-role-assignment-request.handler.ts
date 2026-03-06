import { RoleAssignmentEntityInterface } from '@concepta/nestjs-common';
import { CrudReadHandler } from '@concepta/nestjs-crud';

export class ReadRoleAssignmentRequestHandler extends CrudReadHandler<RoleAssignmentEntityInterface> {}
