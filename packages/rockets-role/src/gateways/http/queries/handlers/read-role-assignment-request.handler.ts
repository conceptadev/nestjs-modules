import { CrudReadHandler } from '@concepta/rockets-crud';

import { RoleAssignmentEntityInterface } from '../../../../domain/interfaces/role-assignment-entity.interface';

export class ReadRoleAssignmentRequestHandler extends CrudReadHandler<RoleAssignmentEntityInterface> {}
