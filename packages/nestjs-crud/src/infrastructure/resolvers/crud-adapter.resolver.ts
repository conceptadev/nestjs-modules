import { Injectable, PlainLiteralObject, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { DeepPartial } from '@concepta/rockets-app';

import { CrudAdapter } from '../adapters/crud.adapter';
import { CrudCreateBatchInterface } from '../dtos/interfaces/crud-create-batch.interface';
import { CrudResponsePaginatedInterface } from '../dtos/interfaces/crud-response-paginated.interface';
import { CrudContextInterface } from '../interceptors/interfaces/crud-context.interface';
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
    ctx: CrudContextInterface<Entity>,
  ): Promise<CrudResponsePaginatedInterface<Entity>> {
    return this.resolveAdapter(ctx).list(ctx);
  }

  async read<Entity extends PlainLiteralObject>(
    ctx: CrudContextInterface<Entity>,
  ): Promise<Entity> {
    return this.resolveAdapter(ctx).read(ctx);
  }

  async create<Entity extends PlainLiteralObject>(
    ctx: CrudContextInterface<Entity>,
    dto: DeepPartial<Entity>,
  ): Promise<Entity> {
    return this.resolveAdapter(ctx).create(ctx, dto);
  }

  async createBatch<Entity extends PlainLiteralObject>(
    ctx: CrudContextInterface<Entity>,
    dto: CrudCreateBatchInterface<DeepPartial<Entity>>,
  ): Promise<Entity[]> {
    return this.resolveAdapter(ctx).createBatch(ctx, dto);
  }

  async update<Entity extends PlainLiteralObject>(
    ctx: CrudContextInterface<Entity>,
    dto: DeepPartial<Entity>,
  ): Promise<Entity> {
    return this.resolveAdapter(ctx).update(ctx, dto);
  }

  async replace<Entity extends PlainLiteralObject>(
    ctx: CrudContextInterface<Entity>,
    dto: DeepPartial<Entity>,
  ): Promise<Entity> {
    return this.resolveAdapter(ctx).replace(ctx, dto);
  }

  async delete<Entity extends PlainLiteralObject>(
    ctx: CrudContextInterface<Entity>,
  ): Promise<Entity | null> {
    return this.resolveAdapter(ctx).delete(ctx);
  }

  async softDelete<Entity extends PlainLiteralObject>(
    ctx: CrudContextInterface<Entity>,
  ): Promise<Entity | null> {
    return this.resolveAdapter(ctx).softDelete(ctx);
  }

  async restore<Entity extends PlainLiteralObject>(
    ctx: CrudContextInterface<Entity>,
  ): Promise<Entity | null> {
    return this.resolveAdapter(ctx).restore(ctx);
  }

  protected resolveAdapter<Entity extends PlainLiteralObject>(
    ctx: CrudContextInterface<Entity>,
  ): CrudAdapter<Entity> {
    const adapterToken = getDynamicAdapterToken(ctx.entity);
    return this.moduleRef.get(adapterToken, { strict: false });
  }
}
