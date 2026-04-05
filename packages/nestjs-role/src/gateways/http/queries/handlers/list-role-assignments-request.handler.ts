import { CrudListHandler } from '@concepta/nestjs-crud';

import { RoleAssignmentEntityInterface } from '../../../../domain/interfaces/role-assignment-entity.interface';

export class ListRoleAssignmentsRequestHandler extends CrudListHandler<RoleAssignmentEntityInterface> {}
