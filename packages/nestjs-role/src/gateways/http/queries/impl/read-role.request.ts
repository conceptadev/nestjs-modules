import { CrudReadQuery } from '@concepta/nestjs-crud';

import { RoleInterface } from '../../../../domain/interfaces/role.interface';

export class ReadRoleRequest extends CrudReadQuery<RoleInterface> {}
