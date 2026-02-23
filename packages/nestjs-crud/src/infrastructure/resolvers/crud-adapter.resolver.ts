import { Injectable, PlainLiteralObject, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { DeepPartial } from '@concepta/nestjs-common';

import { getDynamicAdapterToken } from '../../domain/utils/crud-util';
import { CrudAdapter } from '../adapters/crud.adapter';
import { CrudCreateBatchInterface } from '../dtos/interfaces/crud-create-batch.interface';
import { CrudResponsePaginatedInterface } from '../dtos/interfaces/crud-response-paginated.interface';
import { CrudContextInterface } from '../interceptors/interfaces/crud-context.interface';

import { CrudResolverInterface } from './interfaces/crud-resolver.interface';

/**
 * Adapter resolver - calls adapter directly without handlers.
 *
 * This is the simplest resolver. It bypasses query/command handlers entirely
 * and calls the adapter methods directly. Use this when you don't need
 * custom handler logic.
 *
 * @example
 * ```typescript
 * @Module({
 *   imports: [CrudModule.forRoot()], // Uses CrudAdapterResolver by default
 * })
 * export class AppModule {}
 * ```
 */
@Injectable()
export class CrudAdapterResolver implements CrudResolverInterface {
  constructor(private readonly moduleRef: ModuleRef) {}

  /**
   * No-op - handlers not used by this resolver.
   */
  static decorateQueryHandler(_handlerClass: Type, _queryClass: Type): void {
    // Handlers are not used by CrudAdapterResolver
  }

  /**
   * No-op - handlers not used by this resolver.
   */
  static decorateCommandHandler(
    _handlerClass: Type,
    _commandClass: Type,
  ): void {
    // Handlers are not used by CrudAdapterResolver
  }

  async list<Entity extends PlainLiteralObject>(
    context: CrudContextInterface<Entity>,
  ): Promise<CrudResponsePaginatedInterface<Entity>> {
    return this.resolveAdapter(context).list(context);
  }

  async read<Entity extends PlainLiteralObject>(
    context: CrudContextInterface<Entity>,
  ): Promise<Entity> {
    return this.resolveAdapter(context).read(context);
  }

  async create<Entity extends PlainLiteralObject>(
    context: CrudContextInterface<Entity>,
    dto: DeepPartial<Entity>,
  ): Promise<Entity> {
    return this.resolveAdapter(context).create(context, dto);
  }

  async createBatch<Entity extends PlainLiteralObject>(
    context: CrudContextInterface<Entity>,
    dto: CrudCreateBatchInterface<DeepPartial<Entity>>,
  ): Promise<Entity[]> {
    return this.resolveAdapter(context).createBatch(context, dto);
  }

  async update<Entity extends PlainLiteralObject>(
    context: CrudContextInterface<Entity>,
    dto: DeepPartial<Entity>,
  ): Promise<Entity> {
    return this.resolveAdapter(context).update(context, dto);
  }

  async replace<Entity extends PlainLiteralObject>(
    context: CrudContextInterface<Entity>,
    dto: DeepPartial<Entity>,
  ): Promise<Entity> {
    return this.resolveAdapter(context).replace(context, dto);
  }

  async delete<Entity extends PlainLiteralObject>(
    context: CrudContextInterface<Entity>,
  ): Promise<Entity | null> {
    return this.resolveAdapter(context).delete(context);
  }

  async softDelete<Entity extends PlainLiteralObject>(
    context: CrudContextInterface<Entity>,
  ): Promise<Entity | null> {
    return this.resolveAdapter(context).softDelete(context);
  }

  async restore<Entity extends PlainLiteralObject>(
    context: CrudContextInterface<Entity>,
  ): Promise<Entity | null> {
    return this.resolveAdapter(context).restore(context);
  }

  protected resolveAdapter<Entity extends PlainLiteralObject>(
    context: CrudContextInterface<Entity>,
  ): CrudAdapter<Entity> {
    const adapterToken = getDynamicAdapterToken(context.entity);
    return this.moduleRef.get(adapterToken, { strict: false });
  }
}
