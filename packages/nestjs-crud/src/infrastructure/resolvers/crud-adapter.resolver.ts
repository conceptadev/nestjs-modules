import { Injectable, PlainLiteralObject, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { DeepPartial } from '@concepta/nestjs-common';

import { CrudAdapter } from '../adapters/crud.adapter';
import { CrudCreateBatchInterface } from '../dtos/interfaces/crud-create-batch.interface';
import { CrudResponsePaginatedInterface } from '../dtos/interfaces/crud-response-paginated.interface';
import { CrudContextInterface } from '../interceptors/interfaces/crud-context.interface';
import { WithCrudContextInterface } from '../interceptors/interfaces/with-crud-context.interface';
import { getDynamicAdapterToken } from '../utils/crud-infra.utils';

import { CrudResolverInterface } from './interfaces/crud-resolver.interface';

/**
 * Adapter resolver - calls adapter directly without handlers.
 *
 * This is the simplest resolver. It bypasses query/command handlers entirely
 * and calls the adapter methods directly. Use this when you don't need
 * custom handler logic.
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
    context: WithCrudContextInterface<Entity>,
  ): Promise<CrudResponsePaginatedInterface<Entity>> {
    const crudCtx = context.withCrud();
    return this.resolveAdapter(crudCtx).list(crudCtx);
  }

  async read<Entity extends PlainLiteralObject>(
    context: WithCrudContextInterface<Entity>,
  ): Promise<Entity> {
    const crudCtx = context.withCrud();
    return this.resolveAdapter(crudCtx).read(crudCtx);
  }

  async create<Entity extends PlainLiteralObject>(
    context: WithCrudContextInterface<Entity>,
    dto: DeepPartial<Entity>,
  ): Promise<Entity> {
    const crudCtx = context.withCrud();
    return this.resolveAdapter(crudCtx).create(crudCtx, dto);
  }

  async createBatch<Entity extends PlainLiteralObject>(
    context: WithCrudContextInterface<Entity>,
    dto: CrudCreateBatchInterface<DeepPartial<Entity>>,
  ): Promise<Entity[]> {
    const crudCtx = context.withCrud();
    return this.resolveAdapter(crudCtx).createBatch(crudCtx, dto);
  }

  async update<Entity extends PlainLiteralObject>(
    context: WithCrudContextInterface<Entity>,
    dto: DeepPartial<Entity>,
  ): Promise<Entity> {
    const crudCtx = context.withCrud();
    return this.resolveAdapter(crudCtx).update(crudCtx, dto);
  }

  async replace<Entity extends PlainLiteralObject>(
    context: WithCrudContextInterface<Entity>,
    dto: DeepPartial<Entity>,
  ): Promise<Entity> {
    const crudCtx = context.withCrud();
    return this.resolveAdapter(crudCtx).replace(crudCtx, dto);
  }

  async delete<Entity extends PlainLiteralObject>(
    context: WithCrudContextInterface<Entity>,
  ): Promise<Entity | null> {
    const crudCtx = context.withCrud();
    return this.resolveAdapter(crudCtx).delete(crudCtx);
  }

  async softDelete<Entity extends PlainLiteralObject>(
    context: WithCrudContextInterface<Entity>,
  ): Promise<Entity | null> {
    const crudCtx = context.withCrud();
    return this.resolveAdapter(crudCtx).softDelete(crudCtx);
  }

  async restore<Entity extends PlainLiteralObject>(
    context: WithCrudContextInterface<Entity>,
  ): Promise<Entity | null> {
    const crudCtx = context.withCrud();
    return this.resolveAdapter(crudCtx).restore(crudCtx);
  }

  protected resolveAdapter<Entity extends PlainLiteralObject>(
    context: CrudContextInterface<Entity>,
  ): CrudAdapter<Entity> {
    const adapterToken = getDynamicAdapterToken(context.entity);
    return this.moduleRef.get(adapterToken, { strict: false });
  }
}
