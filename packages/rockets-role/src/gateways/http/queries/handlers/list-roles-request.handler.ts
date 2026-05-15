import { CrudListHandler } from '@concepta/rockets-crud';

import { RoleInterface } from '../../../../domain/interfaces/role.interface';

export class ListRolesRequestHandler extends CrudListHandler<RoleInterface> {}
