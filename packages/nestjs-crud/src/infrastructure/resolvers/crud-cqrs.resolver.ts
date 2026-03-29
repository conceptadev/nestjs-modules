import { Injectable, PlainLiteralObject, Type } from '@nestjs/common';
import {
  CommandBus,
  CommandHandler,
  QueryBus,
  QueryHandler,
} from '@nestjs/cqrs';

import { DeepPartial } from '@concepta/nestjs-common';

import { CrudCreateBatchInterface } from '../dtos/interfaces/crud-create-batch.interface';
import { CrudResponsePaginatedInterface } from '../dtos/interfaces/crud-response-paginated.interface';
import { WithCrudContextInterface } from '../interceptors/interfaces/with-crud-context.interface';

import { CrudResolverInterface } from './interfaces/crud-resolver.interface';

/**
 * CQRS resolver - uses QueryBus/CommandBus for dispatching.
 *
 * This resolver uses the full CQRS pattern. Queries and commands are dispatched
 * through their respective buses, enabling CQRS features like sagas, events,
 * and cross-module routing.
 *
 * Requires `@nestjs/cqrs` as a dependency.
 *
 * @example
 * ```typescript
 * @Module({
 *   imports: [
 *     CrudModule.forRoot({
 *       defaultResolver: CrudCqrsResolver,
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 */
@Injectable()
export class CrudCqrsResolver implements CrudResolverInterface {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  /**
   * Apply `@QueryHandler()` decorator to register the handler with CQRS QueryBus.
   */
  static decorateQueryHandler(handlerClass: Type, queryClass: Type): void {
    QueryHandler(queryClass)(handlerClass);
  }

  /**
   * Apply `@CommandHandler()` decorator to register the handler with CQRS CommandBus.
   */
  static decorateCommandHandler(handlerClass: Type, commandClass: Type): void {
    CommandHandler(commandClass)(handlerClass);
  }

  async list<Entity extends PlainLiteralObject>(
    context: WithCrudContextInterface<Entity>,
  ): Promise<CrudResponsePaginatedInterface<Entity>> {
    const crudCtx = context.withCrud();
    const QueryClass = crudCtx.options.route?.query;
    if (!QueryClass) {
      throw new Error('No query configured for list operation');
    }
    return this.queryBus.execute(new QueryClass(crudCtx));
  }

  async read<Entity extends PlainLiteralObject>(
    context: WithCrudContextInterface<Entity>,
  ): Promise<Entity> {
    const crudCtx = context.withCrud();
    const QueryClass = crudCtx.options.route?.query;
    if (!QueryClass) {
      throw new Error('No query configured for read operation');
    }
    return this.queryBus.execute(new QueryClass(crudCtx));
  }

  async create<Entity extends PlainLiteralObject>(
    context: WithCrudContextInterface<Entity>,
    dto: DeepPartial<Entity>,
  ): Promise<Entity> {
    const crudCtx = context.withCrud();
    const CommandClass = crudCtx.options.route?.command;
    if (!CommandClass) {
      throw new Error('No command configured for create operation');
    }
    return this.commandBus.execute(new CommandClass(crudCtx, dto));
  }

  async createBatch<Entity extends PlainLiteralObject>(
    context: WithCrudContextInterface<Entity>,
    dto: CrudCreateBatchInterface<DeepPartial<Entity>>,
  ): Promise<Entity[]> {
    const crudCtx = context.withCrud();
    const CommandClass = crudCtx.options.route?.command;
    if (!CommandClass) {
      throw new Error('No command configured for createBatch operation');
    }
    return this.commandBus.execute(new CommandClass(crudCtx, dto));
  }

  async update<Entity extends PlainLiteralObject>(
    context: WithCrudContextInterface<Entity>,
    dto: DeepPartial<Entity>,
  ): Promise<Entity> {
    const crudCtx = context.withCrud();
    const CommandClass = crudCtx.options.route?.command;
    if (!CommandClass) {
      throw new Error('No command configured for update operation');
    }
    return this.commandBus.execute(new CommandClass(crudCtx, dto));
  }

  async replace<Entity extends PlainLiteralObject>(
    context: WithCrudContextInterface<Entity>,
    dto: DeepPartial<Entity>,
  ): Promise<Entity> {
    const crudCtx = context.withCrud();
    const CommandClass = crudCtx.options.route?.command;
    if (!CommandClass) {
      throw new Error('No command configured for replace operation');
    }
    return this.commandBus.execute(new CommandClass(crudCtx, dto));
  }

  async delete<Entity extends PlainLiteralObject>(
    context: WithCrudContextInterface<Entity>,
  ): Promise<Entity | null> {
    const crudCtx = context.withCrud();
    const CommandClass = crudCtx.options.route?.command;
    if (!CommandClass) {
      throw new Error('No command configured for delete operation');
    }
    return this.commandBus.execute(new CommandClass(crudCtx));
  }

  async softDelete<Entity extends PlainLiteralObject>(
    context: WithCrudContextInterface<Entity>,
  ): Promise<Entity | null> {
    const crudCtx = context.withCrud();
    const CommandClass = crudCtx.options.route?.command;
    if (!CommandClass) {
      throw new Error('No command configured for soft delete operation');
    }
    return this.commandBus.execute(new CommandClass(crudCtx));
  }

  async restore<Entity extends PlainLiteralObject>(
    context: WithCrudContextInterface<Entity>,
  ): Promise<Entity | null> {
    const crudCtx = context.withCrud();
    const CommandClass = crudCtx.options.route?.command;
    if (!CommandClass) {
      throw new Error('No command configured for restore operation');
    }
    return this.commandBus.execute(new CommandClass(crudCtx));
  }
}
