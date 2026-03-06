import { RoleInterface } from '@concepta/nestjs-common';
import { CrudListHandler } from '@concepta/nestjs-crud';

export class ListRolesRequestHandler extends CrudListHandler<RoleInterface> {}
