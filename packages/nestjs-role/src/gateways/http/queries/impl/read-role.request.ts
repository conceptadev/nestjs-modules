import { CrudReadQuery } from '@concepta/nestjs-crud';

import { type RoleInterface } from '../../../../domain/interfaces/role.interface';

export class ReadRoleRequest extends CrudReadQuery<RoleInterface> {}
