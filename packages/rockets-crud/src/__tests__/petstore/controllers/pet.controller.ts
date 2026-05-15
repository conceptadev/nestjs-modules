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
import { Pet } from '../dto/pet.dto';

@CrudController({
  path: 'pet',
  entity: 'Pet',
  request: {
    body: Pet,
    params: { petId: { field: 'petId', type: 'number', primary: true } },
  },
  response: { resource: Pet },
})
@ApiTags('pet')
export class PetController {
  constructor(
    @Inject(CrudAdapterResolver)
    protected readonly crudResolver: CrudResolverInterface,
  ) {}

  @CrudCreate({
    command: CrudCreateCommand,
    api: { operation: { operationId: 'addPet' } },
  })
  async addPet(@Ctx(CrudCtx) ctx: CrudContextInterface, @CrudBody() dto: Pet) {
    return this.crudResolver.create(ctx, dto);
  }

  @CrudRead({
    query: CrudReadQuery,
    path: ':petId',
    api: { operation: { operationId: 'getPetById' } },
  })
  async getPetById(@Ctx(CrudCtx) ctx: CrudContextInterface) {
    return this.crudResolver.read(ctx);
  }

  @CrudReplace({
    command: CrudReplaceCommand,
    path: ':petId',
    api: { operation: { operationId: 'updatePetWithForm' } },
  })
  async updatePetWithForm(
    @Ctx(CrudCtx) ctx: CrudContextInterface,
    @CrudBody() dto: Pet,
  ) {
    return this.crudResolver.replace(ctx, dto);
  }

  @CrudDelete({
    command: CrudDeleteCommand,
    path: ':petId',
    api: { operation: { operationId: 'deletePet' } },
  })
  async deletePet(@Ctx(CrudCtx) ctx: CrudContextInterface) {
    return this.crudResolver.delete(ctx);
  }
}
