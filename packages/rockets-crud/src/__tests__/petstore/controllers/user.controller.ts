import { Inject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Ctx } from '@concepta/rockets-app';

import { CrudCreateCommand } from '../../../application/commands/impl/crud-create.command';
import { CrudDeleteCommand } from '../../../application/commands/impl/crud-delete.command';
import { CrudReplaceCommand } from '../../../application/commands/impl/crud-replace.command';
import { CrudReadQuery } from '../../../application/queries/impl/crud-read.query';
import { CrudController } from '../../../infrastructure/decorators/controller/crud-controller.decorator';
import { CrudCreate } from '../../../infrastructure/decorators/operations/crud-create.decorator';
import { CrudDelete } from '../../../infrastructure/decorators/operations/crud-delete.decorator';
import { CrudRead } from '../../../infrastructure/decorators/operations/crud-read.decorator';
import { CrudReplace } from '../../../infrastructure/decorators/operations/crud-replace.decorator';
import { CrudBody } from '../../../infrastructure/decorators/params/crud-body.decorator';
import { CrudCtx } from '../../../infrastructure/interceptors/crud-context.overlay';
import { CrudContextInterface } from '../../../infrastructure/interceptors/interfaces/crud-context.interface';
import { CrudAdapterResolver } from '../../../infrastructure/resolvers/crud-adapter.resolver';
import { CrudResolverInterface } from '../../../infrastructure/resolvers/interfaces/crud-resolver.interface';
import { User } from '../dto/user.dto';

@CrudController({
  path: 'user',
  entity: 'User',
  request: {
    body: User,
    params: { username: { field: 'username', type: 'string', primary: true } },
  },
  response: { resource: User },
})
@ApiTags('user')
export class UserController {
  constructor(
    @Inject(CrudAdapterResolver)
    protected readonly crudResolver: CrudResolverInterface,
  ) {}

  @CrudCreate({
    command: CrudCreateCommand,
    api: { operation: { operationId: 'createUser' } },
  })
  async createUser(
    @Ctx(CrudCtx) ctx: CrudContextInterface,
    @CrudBody() dto: User,
  ) {
    return this.crudResolver.create(ctx, dto);
  }

  @CrudRead({
    query: CrudReadQuery,
    path: ':username',
    api: { operation: { operationId: 'getUserByName' } },
  })
  async getUserByName(@Ctx(CrudCtx) ctx: CrudContextInterface) {
    return this.crudResolver.read(ctx);
  }

  @CrudReplace({
    command: CrudReplaceCommand,
    path: ':username',
    api: { operation: { operationId: 'updateUser' } },
  })
  async updateUser(
    @Ctx(CrudCtx) ctx: CrudContextInterface,
    @CrudBody() dto: User,
  ) {
    return this.crudResolver.replace(ctx, dto);
  }

  @CrudDelete({
    command: CrudDeleteCommand,
    path: ':username',
    api: { operation: { operationId: 'deleteUser' } },
  })
  async deleteUser(@Ctx(CrudCtx) ctx: CrudContextInterface) {
    return this.crudResolver.delete(ctx);
  }
}
