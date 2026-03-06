import { RoleInterface } from '@concepta/nestjs-common';
import { CrudReadQuery } from '@concepta/nestjs-crud';

export class ReadRoleRequest extends CrudReadQuery<RoleInterface> {}
