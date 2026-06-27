import { CrudListHandler } from '@concepta/nestjs-crud';

import { type RoleInterface } from '../../../../domain/interfaces/role.interface';

export class ListRolesRequestHandler extends CrudListHandler<RoleInterface> {}
