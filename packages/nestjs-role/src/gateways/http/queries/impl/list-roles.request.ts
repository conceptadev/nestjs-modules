import { CrudListQuery } from '@concepta/nestjs-crud';

import { RoleInterface } from '../../../../domain/interfaces/role.interface';

export class ListRolesRequest extends CrudListQuery<RoleInterface> {}
