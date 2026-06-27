import { CrudReadHandler } from '@concepta/nestjs-crud';

import { type RoleAssignmentEntityInterface } from '../../../../domain/interfaces/role-assignment-entity.interface';

export class ReadRoleAssignmentRequestHandler extends CrudReadHandler<RoleAssignmentEntityInterface> {}
