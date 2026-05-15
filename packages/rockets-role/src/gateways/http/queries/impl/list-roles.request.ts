import { CrudListQuery } from '@concepta/rockets-crud';

import { RoleInterface } from '../../../../domain/interfaces/role.interface';

export class ListRolesRequest extends CrudListQuery<RoleInterface> {}
