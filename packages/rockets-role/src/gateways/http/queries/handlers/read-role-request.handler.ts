import { CrudReadHandler } from '@concepta/rockets-crud';

import { RoleInterface } from '../../../../domain/interfaces/role.interface';

export class ReadRoleRequestHandler extends CrudReadHandler<RoleInterface> {}
