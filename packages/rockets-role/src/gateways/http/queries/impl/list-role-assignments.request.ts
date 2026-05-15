import { CrudListQuery } from '@concepta/rockets-crud';

import { RoleAssignmentEntityInterface } from '../../../../domain/interfaces/role-assignment-entity.interface';

export class ListRoleAssignmentsRequest extends CrudListQuery<RoleAssignmentEntityInterface> {}
