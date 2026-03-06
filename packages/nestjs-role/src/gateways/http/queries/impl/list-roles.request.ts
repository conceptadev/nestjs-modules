import { RoleInterface } from '@concepta/nestjs-common';
import { CrudListQuery } from '@concepta/nestjs-crud';

export class ListRolesRequest extends CrudListQuery<RoleInterface> {}
