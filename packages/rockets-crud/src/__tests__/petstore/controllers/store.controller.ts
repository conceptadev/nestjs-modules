import { Inject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Ctx } from '@concepta/rockets-app';

import { CrudCreateCommand } from '../../../application/commands/impl/crud-create.command';
import { CrudDeleteCommand } from '../../../application/commands/impl/crud-delete.command';
import { CrudReadQuery } from '../../../application/queries/impl/crud-read.query';
import { CrudController } from '../../../infrastructure/decorators/controller/crud-controller.decorator';
import { CrudCreate } from '../../../infrastructure/decorators/operations/crud-create.decorator';
import { CrudDelete } from '../../../infrastructure/decorators/operations/crud-delete.decorator';
import { CrudRead } from '../../../infrastructure/decorators/operations/crud-read.decorator';
import { CrudBody } from '../../../infrastructure/decorators/params/crud-body.decorator';
import { CrudCtx } from '../../../infrastructure/interceptors/crud-context.overlay';
import { CrudContextInterface } from '../../../infrastructure/interceptors/interfaces/crud-context.interface';
import { CrudAdapterResolver } from '../../../infrastructure/resolvers/crud-adapter.resolver';
import { CrudResolverInterface } from '../../../infrastructure/resolvers/interfaces/crud-resolver.interface';
import { Order } from '../dto/order.dto';

@CrudController({
  path: 'store/order',
  entity: 'Order',
  request: {
    body: Order,
    params: { orderId: { field: 'orderId', type: 'number', primary: true } },
  },
  response: { resource: Order },
})
@ApiTags('store')
export class StoreController {
  constructor(
    @Inject(CrudAdapterResolver)
    protected readonly crudResolver: CrudResolverInterface,
  ) {}

  @CrudCreate({
    command: CrudCreateCommand,
    api: { operation: { operationId: 'placeOrder' } },
  })
  async placeOrder(
    @Ctx(CrudCtx) ctx: CrudContextInterface,
    @CrudBody() dto: Order,
  ) {
    return this.crudResolver.create(ctx, dto);
  }

  @CrudRead({
    query: CrudReadQuery,
    path: ':orderId',
    api: { operation: { operationId: 'getOrderById' } },
  })
  async getOrderById(@Ctx(CrudCtx) ctx: CrudContextInterface) {
    return this.crudResolver.read(ctx);
  }

  @CrudDelete({
    command: CrudDeleteCommand,
    path: ':orderId',
    api: { operation: { operationId: 'deleteOrder' } },
  })
  async deleteOrder(@Ctx(CrudCtx) ctx: CrudContextInterface) {
    return this.crudResolver.delete(ctx);
  }
}
