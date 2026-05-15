import { CrudReadQuery } from '@concepta/rockets-crud';

import { RoleAssignmentEntityInterface } from '../../../../domain/interfaces/role-assignment-entity.interface';

export class ReadRoleAssignmentRequest extends CrudReadQuery<RoleAssignmentEntityInterface> {}
