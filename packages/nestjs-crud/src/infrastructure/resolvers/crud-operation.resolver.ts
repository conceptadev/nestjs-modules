import { Injectable, PlainLiteralObject, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { DeepPartial } from '@concepta/nestjs-common';

import { CrudCreateBatchInterface } from '../dtos/interfaces/crud-create-batch.interface';
import { CrudResponsePaginatedInterface } from '../dtos/interfaces/crud-response-paginated.interface';
import { WithCrudContextInterface } from '../interceptors/interfaces/with-crud-context.interface';

import { CrudResolverInterface } from './interfaces/crud-resolver.interface';

/**
 * Operation resolver - creates query/command instances and calls handlers directly.
 *
 * This resolver uses query/command handlers but does NOT route through the CQRS bus.
 * Handlers are resolved directly via ModuleRef and invoked. Use this when you need
 * custom handler logic but don't need CQRS features like sagas or events.
 *
 * @example
 * ```typescript
 * @Module({
 *   imports: [
 *     CrudModule.forRoot({
 *       defaultResolver: CrudOperationResolver,
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 */
@Injectable()
export class CrudOperationResolver implements CrudResolverInterface {
  constructor(private readonly moduleRef: ModuleRef) {}

  /**
   * No-op - handler is resolved directly via ModuleRef.
   */
  static decorateQueryHandler(_handlerClass: Type, _queryClass: Type): void {
    // No additional decorators needed
  }

  /**
   * No-op - handler is resolved directly via ModuleRef.
   */
  static decorateCommandHandler(
    _handlerClass: Type,
    _commandClass: Type,
  ): void {
    // No additional decorators needed
  }

  async list<Entity extends PlainLiteralObject>(
    context: WithCrudContextInterface<Entity>,
  ): Promise<CrudResponsePaginatedInterface<Entity>> {
    const crudCtx = context.withCrud();
    const QueryClass = crudCtx.options.route?.query;
    const HandlerClass = crudCtx.options.route?.queryHandler?.resolved;
    if (!QueryClass || !HandlerClass) {
      throw new Error('No query/handler configured for list operation');
    }
    return this.executeQuery(HandlerClass, new QueryClass(crudCtx));
  }

  async read<Entity extends PlainLiteralObject>(
    context: WithCrudContextInterface<Entity>,
  ): Promise<Entity> {
    const crudCtx = context.withCrud();
    const QueryClass = crudCtx.options.route?.query;
    const HandlerClass = crudCtx.options.route?.queryHandler?.resolved;
    if (!QueryClass || !HandlerClass) {
      throw new Error('No query/handler configured for read operation');
    }
    return this.executeQuery(HandlerClass, new QueryClass(crudCtx));
  }

  async create<Entity extends PlainLiteralObject>(
    context: WithCrudContextInterface<Entity>,
    dto: DeepPartial<Entity>,
  ): Promise<Entity> {
    const crudCtx = context.withCrud();
    const CommandClass = crudCtx.options.route?.command;
    const HandlerClass = crudCtx.options.route?.commandHandler?.resolved;
    if (!CommandClass || !HandlerClass) {
      throw new Error('No command/handler configured for create operation');
    }
    return this.executeCommand(HandlerClass, new CommandClass(crudCtx, dto));
  }

  async createBatch<Entity extends PlainLiteralObject>(
    context: WithCrudContextInterface<Entity>,
    dto: CrudCreateBatchInterface<DeepPartial<Entity>>,
  ): Promise<Entity[]> {
    const crudCtx = context.withCrud();
    const CommandClass = crudCtx.options.route?.command;
    const HandlerClass = crudCtx.options.route?.commandHandler?.resolved;
    if (!CommandClass || !HandlerClass) {
      throw new Error(
        'No command/handler configured for createBatch operation',
      );
    }
    return this.executeCommand(HandlerClass, new CommandClass(crudCtx, dto));
  }

  async update<Entity extends PlainLiteralObject>(
    context: WithCrudContextInterface<Entity>,
    dto: DeepPartial<Entity>,
  ): Promise<Entity> {
    const crudCtx = context.withCrud();
    const CommandClass = crudCtx.options.route?.command;
    const HandlerClass = crudCtx.options.route?.commandHandler?.resolved;
    if (!CommandClass || !HandlerClass) {
      throw new Error('No command/handler configured for update operation');
    }
    return this.executeCommand(HandlerClass, new CommandClass(crudCtx, dto));
  }

  async replace<Entity extends PlainLiteralObject>(
    context: WithCrudContextInterface<Entity>,
    dto: DeepPartial<Entity>,
  ): Promise<Entity> {
    const crudCtx = context.withCrud();
    const CommandClass = crudCtx.options.route?.command;
    const HandlerClass = crudCtx.options.route?.commandHandler?.resolved;
    if (!CommandClass || !HandlerClass) {
      throw new Error('No command/handler configured for replace operation');
    }
    return this.executeCommand(HandlerClass, new CommandClass(crudCtx, dto));
  }

  async delete<Entity extends PlainLiteralObject>(
    context: WithCrudContextInterface<Entity>,
  ): Promise<Entity | null> {
    const crudCtx = context.withCrud();
    const CommandClass = crudCtx.options.route?.command;
    const HandlerClass = crudCtx.options.route?.commandHandler?.resolved;
    if (!CommandClass || !HandlerClass) {
      throw new Error('No command/handler configured for delete operation');
    }
    return this.executeCommand(HandlerClass, new CommandClass(crudCtx));
  }

  async softDelete<Entity extends PlainLiteralObject>(
    context: WithCrudContextInterface<Entity>,
  ): Promise<Entity | null> {
    const crudCtx = context.withCrud();
    const CommandClass = crudCtx.options.route?.command;
    const HandlerClass = crudCtx.options.route?.commandHandler?.resolved;
    if (!CommandClass || !HandlerClass) {
      throw new Error(
        'No command/handler configured for soft delete operation',
      );
    }
    return this.executeCommand(HandlerClass, new CommandClass(crudCtx));
  }

  async restore<Entity extends PlainLiteralObject>(
    context: WithCrudContextInterface<Entity>,
  ): Promise<Entity | null> {
    const crudCtx = context.withCrud();
    const CommandClass = crudCtx.options.route?.command;
    const HandlerClass = crudCtx.options.route?.commandHandler?.resolved;
    if (!CommandClass || !HandlerClass) {
      throw new Error('No command/handler configured for restore operation');
    }
    return this.executeCommand(HandlerClass, new CommandClass(crudCtx));
  }

  /**
   * Execute a query handler. Return type is determined by the caller.
   */
  private executeQuery<T>(handlerClass: Type, query: unknown): Promise<T> {
    const handler = this.moduleRef.get(handlerClass, { strict: false });
    return handler.execute(query);
  }

  /**
   * Execute a command handler. Return type is determined by the caller.
   */
  private executeCommand<T>(handlerClass: Type, command: unknown): Promise<T> {
    const handler = this.moduleRef.get(handlerClass, { strict: false });
    return handler.execute(command);
  }
}
