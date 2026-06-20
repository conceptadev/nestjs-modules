import { CrudListHandler } from '@concepta/nestjs-crud';

import { RoleInterface } from '../../../../domain/interfaces/role.interface';

export class ListRolesRequestHandler extends CrudListHandler<RoleInterface> {}
