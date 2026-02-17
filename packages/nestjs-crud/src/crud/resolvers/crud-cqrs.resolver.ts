import { Injectable, PlainLiteralObject, Type } from '@nestjs/common';
import {
  CommandBus,
  CommandHandler,
  QueryBus,
  QueryHandler,
} from '@nestjs/cqrs';

import { DeepPartial } from '@concepta/nestjs-common';

import { CrudContextInterface } from '../interfaces/crud-context.interface';
import { CrudCreateBatchInterface } from '../interfaces/crud-create-batch.interface';
import { CrudResolverInterface } from '../interfaces/crud-resolver.interface';
import { CrudResponsePaginatedInterface } from '../interfaces/crud-response-paginated.interface';

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
    context: CrudContextInterface<Entity>,
  ): Promise<CrudResponsePaginatedInterface<Entity>> {
    const QueryClass = context.options.route?.query;
    if (!QueryClass) {
      throw new Error('No query configured for list operation');
    }
    return this.queryBus.execute(new QueryClass(context));
  }

  async read<Entity extends PlainLiteralObject>(
    context: CrudContextInterface<Entity>,
  ): Promise<Entity> {
    const QueryClass = context.options.route?.query;
    if (!QueryClass) {
      throw new Error('No query configured for read operation');
    }
    return this.queryBus.execute(new QueryClass(context));
  }

  async create<Entity extends PlainLiteralObject>(
    context: CrudContextInterface<Entity>,
    dto: DeepPartial<Entity>,
  ): Promise<Entity> {
    const CommandClass = context.options.route?.command;
    if (!CommandClass) {
      throw new Error('No command configured for create operation');
    }
    return this.commandBus.execute(new CommandClass(context, dto));
  }

  async createBatch<Entity extends PlainLiteralObject>(
    context: CrudContextInterface<Entity>,
    dto: CrudCreateBatchInterface<DeepPartial<Entity>>,
  ): Promise<Entity[]> {
    const CommandClass = context.options.route?.command;
    if (!CommandClass) {
      throw new Error('No command configured for createBatch operation');
    }
    return this.commandBus.execute(new CommandClass(context, dto));
  }

  async update<Entity extends PlainLiteralObject>(
    context: CrudContextInterface<Entity>,
    dto: DeepPartial<Entity>,
  ): Promise<Entity> {
    const CommandClass = context.options.route?.command;
    if (!CommandClass) {
      throw new Error('No command configured for update operation');
    }
    return this.commandBus.execute(new CommandClass(context, dto));
  }

  async replace<Entity extends PlainLiteralObject>(
    context: CrudContextInterface<Entity>,
    dto: DeepPartial<Entity>,
  ): Promise<Entity> {
    const CommandClass = context.options.route?.command;
    if (!CommandClass) {
      throw new Error('No command configured for replace operation');
    }
    return this.commandBus.execute(new CommandClass(context, dto));
  }

  async delete<Entity extends PlainLiteralObject>(
    context: CrudContextInterface<Entity>,
  ): Promise<Entity | null> {
    const CommandClass = context.options.route?.command;
    if (!CommandClass) {
      throw new Error('No command configured for delete operation');
    }
    return this.commandBus.execute(new CommandClass(context));
  }

  async softDelete<Entity extends PlainLiteralObject>(
    context: CrudContextInterface<Entity>,
  ): Promise<Entity | null> {
    const CommandClass = context.options.route?.command;
    if (!CommandClass) {
      throw new Error('No command configured for soft delete operation');
    }
    return this.commandBus.execute(new CommandClass(context));
  }

  async restore<Entity extends PlainLiteralObject>(
    context: CrudContextInterface<Entity>,
  ): Promise<Entity | null> {
    const CommandClass = context.options.route?.command;
    if (!CommandClass) {
      throw new Error('No command configured for restore operation');
    }
    return this.commandBus.execute(new CommandClass(context));
  }
}
