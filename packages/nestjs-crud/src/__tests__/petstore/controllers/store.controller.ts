import { Inject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Ctx } from '@concepta/nestjs-core';

import { CrudCreateCommand } from '../../../application/commands/impl/crud-create.command.js';
import { CrudDeleteCommand } from '../../../application/commands/impl/crud-delete.command.js';
import { CrudReadQuery } from '../../../application/queries/impl/crud-read.query.js';
import { CrudController } from '../../../infrastructure/decorators/controller/crud-controller.decorator.js';
import { CrudCreate } from '../../../infrastructure/decorators/operations/crud-create.decorator.js';
import { CrudDelete } from '../../../infrastructure/decorators/operations/crud-delete.decorator.js';
import { CrudRead } from '../../../infrastructure/decorators/operations/crud-read.decorator.js';
import { CrudBody } from '../../../infrastructure/decorators/params/crud-body.decorator.js';
import { CrudCtx } from '../../../infrastructure/interceptors/crud-context.overlay.js';
import { CrudContextInterface } from '../../../infrastructure/interceptors/interfaces/crud-context.interface.js';
import { CrudAdapterResolver } from '../../../infrastructure/resolvers/crud-adapter.resolver.js';
import { CrudResolverInterface } from '../../../infrastructure/resolvers/interfaces/crud-resolver.interface.js';
import { Order } from '../dto/order.dto.js';

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
