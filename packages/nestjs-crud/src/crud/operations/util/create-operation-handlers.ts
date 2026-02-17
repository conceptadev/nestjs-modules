import { Inject, Injectable, PlainLiteralObject, Type } from '@nestjs/common';

import { CrudAdapter } from '../../adapters/crud.adapter';
import { CrudControllerDomainInterface } from '../../interfaces/crud-controller-domain.interface';
import {
  CrudResolverInterface,
  CrudResolverStatic,
} from '../../interfaces/crud-resolver.interface';
import { CrudAdapterResolver } from '../../resolvers/crud-adapter.resolver';
import { getControllerName, getDynamicAdapterToken } from '../../util';
import { CrudCommandHandler } from '../handlers/crud-command.handler';
import { CrudQueryHandler } from '../handlers/crud-query.handler';

interface CreateHandlerOptionsBase extends CrudControllerDomainInterface {
  /** Method name for unique class naming */
  methodName?: string;
  /** Resolver class that controls decoration (defaults to CrudAdapterResolver) */
  resolverClass?: Type<CrudResolverInterface> & CrudResolverStatic;
}

interface CreateQueryHandlerOptions<Entity extends PlainLiteralObject>
  extends CreateHandlerOptionsBase {
  /** Base handler class to extend */
  baseClass: Type<CrudQueryHandler<Entity>>;
  /** Query class for handler registration */
  queryClass: Type;
}

interface CreateCommandHandlerOptions<Entity extends PlainLiteralObject>
  extends CreateHandlerOptionsBase {
  /** Base handler class to extend */
  baseClass: Type<CrudCommandHandler<Entity>>;
  /** Command class for handler registration */
  commandClass: Type;
}

/**
 * Creates an entity-specific query handler class.
 *
 * Uses the provided resolver class to apply appropriate decorators.
 */
export function createQueryHandler<Entity extends PlainLiteralObject>(
  options: CreateQueryHandlerOptions<Entity>,
): Type<CrudQueryHandler<Entity>> {
  const {
    entity,
    methodName,
    baseClass,
    queryClass,
    resolverClass = CrudAdapterResolver,
  } = options;
  const adapterToken = getDynamicAdapterToken(entity);
  const baseName = getControllerName(options);
  const nameParts = [baseName, methodName, 'Handler'].filter(Boolean);
  class HandlerClass extends baseClass {
    constructor(@Inject(adapterToken) adapter: CrudAdapter<Entity>) {
      super(adapter);
    }
  }
  Object.defineProperty(HandlerClass, 'name', {
    value: nameParts.join('_'),
  });

  // Apply @Injectable() universally to all handlers
  Injectable()(HandlerClass);

  // Let resolver add any additional decorators (e.g., @QueryHandler for CQRS)
  resolverClass.decorateQueryHandler(HandlerClass, queryClass);

  return HandlerClass;
}

/**
 * Creates an entity-specific command handler class.
 *
 * Uses the provided resolver class to apply appropriate decorators.
 */
export function createCommandHandler<Entity extends PlainLiteralObject>(
  options: CreateCommandHandlerOptions<Entity>,
): Type<CrudCommandHandler<Entity>> {
  const {
    entity,
    methodName,
    baseClass,
    commandClass,
    resolverClass = CrudAdapterResolver,
  } = options;
  const adapterToken = getDynamicAdapterToken(entity);
  const baseName = getControllerName(options);
  const nameParts = [baseName, methodName, 'Handler'].filter(Boolean);
  class HandlerClass extends baseClass {
    constructor(@Inject(adapterToken) adapter: CrudAdapter<Entity>) {
      super(adapter);
    }
  }
  Object.defineProperty(HandlerClass, 'name', {
    value: nameParts.join('_'),
  });

  // Apply @Injectable() universally to all handlers
  Injectable()(HandlerClass);

  // Let resolver add any additional decorators (e.g., @CommandHandler for CQRS)
  resolverClass.decorateCommandHandler(HandlerClass, commandClass);

  return HandlerClass;
}
