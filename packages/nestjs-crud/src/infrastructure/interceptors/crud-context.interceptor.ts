import {
  CallHandler,
  ExecutionContext,
  forwardRef,
  HttpStatus,
  Inject,
  Injectable,
  NestInterceptor,
  PlainLiteralObject,
} from '@nestjs/common';

import {
  getAppContext,
  Operation,
  RuntimeException,
} from '@concepta/nestjs-common';

import { ControllerTarget, MethodHandler } from '../../crud.types';
import { CrudContextException } from '../exceptions/crud-context.exception';
import { CrudQueryParser } from '../request/crud-query.parser';
import { CrudLocalResolverService } from '../services/crud-local-resolver.service';
import { CrudMetaview } from '../services/crud-metaview.service';
import { operationToAction } from '../utils/crud-infra.utils';

import { CrudContextInterface } from './interfaces/crud-context.interface';
import { CrudRouteOptionsInterface } from './interfaces/crud-route-options.interface';

@Injectable()
export class CrudContextInterceptor<
  T extends PlainLiteralObject = PlainLiteralObject,
> implements NestInterceptor
{
  constructor(
    @Inject(forwardRef(() => CrudMetaview))
    private reflectionService: CrudMetaview<T>,
    @Inject(forwardRef(() => CrudLocalResolverService))
    private localResolverService: CrudLocalResolverService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest();
    const ctx = getAppContext<CrudContextInterface<T>>(req);

    try {
      // Check if already processed by looking for operation on context
      if (ctx.has('operation')) {
        return next.handle();
      }

      const target = context.getClass();
      const handler = context.getHandler();
      const ctxOptions = this.reflectionService.getContextOptions(
        target,
        handler,
      );

      const parser = CrudQueryParser.create<T>();

      parser.parseQuery(req.query);

      // Parse route parameters if they exist and are configured
      if (req.params) {
        parser.parseParams(req.params, ctxOptions.params ?? {});
      }

      // Get entity name from controller metadata
      const entity = this.reflectionService.getEntity(target);

      if (!entity) {
        throw new CrudContextException({
          message: `No entity defined for ${target.name} (use @CrudEntity or @CrudController)`,
        });
      }

      // Get operation
      const operation = this.reflectionService.getOperation(handler);

      if (!operation) {
        throw new CrudContextException({
          message: `No CRUD operation defined for ${target.name}.${handler.name}`,
        });
      }

      // Build current route options
      const route = this.getRouteOptions(target, handler, operation);

      // Register values on the aggregated context (read-only after set)
      ctx.register('entity', entity);
      ctx.register('operation', operation);
      ctx.register('action', operationToAction(operation));
      ctx.register('params', parser.getRouteParams());
      ctx.register('query', parser.getParsedQuery());
      ctx.register('options', {
        query: ctxOptions.query,
        params: ctxOptions.params,
        route,
      });
      ctx.register('locals', {});

      // Resolve CrudLocal providers (each key frozen after resolution)
      const localClasses = this.reflectionService.getLocals(target, handler);
      await this.localResolverService.resolve(context, ctx, localClasses);

      return next.handle();
    } catch (error) {
      throw new CrudContextException({
        httpStatus:
          error instanceof RuntimeException
            ? error.httpStatus
            : HttpStatus.BAD_REQUEST,
        originalError: error,
      });
    }
  }

  private getRouteOptions(
    target: ControllerTarget,
    handler: MethodHandler,
    operation: Operation,
  ): CrudRouteOptionsInterface<T> {
    const queryOptions = this.reflectionService.getQuery(handler);
    const commandOptions = this.reflectionService.getCommand(handler);

    const routeOptions: CrudRouteOptionsInterface<T> = {
      query: queryOptions?.resolved,
      queryHandler: this.reflectionService.getQueryHandler(handler),
      command: commandOptions?.resolved,
      commandHandler: this.reflectionService.getCommandHandler(handler),
    };

    // Add route-specific options based on operation
    switch (operation) {
      case Operation.Delete:
      case Operation.SoftDelete:
        routeOptions.returnDeleted = this.reflectionService.getReturnDeleted(
          target,
          handler,
        );
        break;
      case Operation.Restore:
        routeOptions.returnRestored = this.reflectionService.getReturnRestored(
          target,
          handler,
        );
        break;
    }

    return routeOptions;
  }
}
