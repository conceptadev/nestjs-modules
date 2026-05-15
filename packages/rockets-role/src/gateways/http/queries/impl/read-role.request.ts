import { CrudReadQuery } from '@concepta/rockets-crud';

import { RoleInterface } from '../../../../domain/interfaces/role.interface';

export class ReadRoleRequest extends CrudReadQuery<RoleInterface> {}
