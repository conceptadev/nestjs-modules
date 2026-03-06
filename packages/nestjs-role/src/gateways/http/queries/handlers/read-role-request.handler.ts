import { RoleInterface } from '@concepta/nestjs-common';
import { CrudReadHandler } from '@concepta/nestjs-crud';

export class ReadRoleRequestHandler extends CrudReadHandler<RoleInterface> {}
