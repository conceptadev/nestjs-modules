import { CrudReadHandler } from '@concepta/nestjs-crud';

import { type RoleInterface } from '../../../../domain/interfaces/role.interface';

export class ReadRoleRequestHandler extends CrudReadHandler<RoleInterface> {}
