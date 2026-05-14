import {
  ExecutionContext,
  forwardRef,
  HttpStatus,
  Inject,
  Injectable,
  PlainLiteralObject,
} from '@nestjs/common';

import {
  ContextOverlayInterceptor,
  getAppContext,
  Operation,
  OverlayRef,
  RuntimeException,
} from '@concepta/rockets-app';

import { ControllerTarget, MethodHandler } from '../../crud.types';
import { CrudContextException } from '../exceptions/crud-context.exception';
import { CrudQueryParser } from '../request/crud-query.parser';
import { CrudMetaview } from '../services/crud-metaview.service';
import { operationToAction } from '../utils/crud-infra.utils';

import { CrudContextInterface } from './interfaces/crud-context.interface';
import { CrudRouteOptionsInterface } from './interfaces/crud-route-options.interface';

export const CrudCtx = new OverlayRef<'withCrud', CrudContextInterface>(
  'withCrud',
);

@Injectable()
export class CrudContextOverlay<
  T extends PlainLiteralObject = PlainLiteralObject,
> extends ContextOverlayInterceptor {
  readonly ref = CrudCtx;

  constructor(
    @Inject(forwardRef(() => CrudMetaview))
    private reflectionService: CrudMetaview<T>,
  ) {
    super();
  }

  private resolve(
    context: ExecutionContext | undefined,
  ): CrudContextInterface<T> {
    if (!context) {
      throw new CrudContextException({
        message: 'CrudContextOverlay requires an ExecutionContext',
      });
    }

    try {
      const req = context.switchToHttp().getRequest();
      const target = context.getClass();
      const handler = context.getHandler();

      const ctxOptions = this.reflectionService.getContextOptions(
        target,
        handler,
      );

      const parser = CrudQueryParser.create<T>();
      parser.parseQuery(req.query);

      if (req.params) {
        parser.parseParams(req.params, ctxOptions.params ?? {});
      }

      const entity = this.reflectionService.getEntity(target);

      if (!entity) {
        throw new CrudContextException({
          message: `No entity defined for ${target.name} (use @CrudEntity or @CrudController)`,
        });
      }

      const operation = this.reflectionService.getOperation(handler);

      if (!operation) {
        throw new CrudContextException({
          message: `No CRUD operation defined for ${target.name}.${handler.name}`,
        });
      }

      const route = this.getRouteOptions(target, handler, operation);

      const result: CrudContextInterface<T> = {
        entity,
        operation,
        action: operationToAction(operation),
        params: parser.getRouteParams(),
        query: parser.getParsedQuery(),
        options: {
          query: ctxOptions.query,
          params: ctxOptions.params,
          route,
        },
      };

      return result;
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

  attach(context: ExecutionContext): void {
    const target = context.getClass();
    const handler = context.getHandler();

    if (
      !this.reflectionService.getEntity(target) ||
      !this.reflectionService.getOperation(handler)
    ) {
      return;
    }

    const request = context.switchToHttp().getRequest();
    const ctx = getAppContext(request);
    const resolved = this.resolve(context);
    ctx.defineOverlay(CrudCtx, resolved);
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
