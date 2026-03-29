import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import {
  CallHandler,
  ExecutionContext,
  forwardRef,
  Inject,
  Injectable,
  NestInterceptor,
  PlainLiteralObject,
} from '@nestjs/common';

import { getAppContext } from '@concepta/nestjs-common';

import { CrudLocalResolverService } from '../services/crud-local-resolver.service';
import { CrudMetaview } from '../services/crud-metaview.service';

import { CrudLocal } from './interfaces/crud-local.interface';

@Injectable()
export class CrudLocalsInterceptor<
  T extends PlainLiteralObject = PlainLiteralObject,
> implements NestInterceptor
{
  constructor(
    @Inject(forwardRef(() => CrudMetaview))
    private reflectionService: CrudMetaview<T>,
    @Inject(forwardRef(() => CrudLocalResolverService))
    private localResolverService: CrudLocalResolverService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const req = context.switchToHttp().getRequest();
    const ctx = getAppContext(req);

    // Skip if withLocal is already defined
    if ('withLocal' in ctx) {
      return next.handle();
    }

    const target = context.getClass();
    const handler = context.getHandler();
    const localClasses = this.reflectionService.getLocals(target, handler);

    // Eagerly resolve all locals
    const resolvedLocals: Record<string, unknown> = {};

    if (localClasses && localClasses.length > 0) {
      await this.localResolverService.resolve(
        context,
        ctx,
        localClasses,
        resolvedLocals,
      );
    }

    // Define withLocal accessor on the context
    Object.defineProperty(ctx, 'withLocal', {
      value: function <L extends PlainLiteralObject>(
        localClass: CrudLocal<L>,
      ): Readonly<L> | undefined {
        return resolvedLocals[localClass.KEY] as Readonly<L> | undefined;
      },
      enumerable: false,
      configurable: false,
      writable: false,
    });

    // Execute transforms after the controller response
    return next.handle().pipe(
      mergeMap(async (response) => {
        if (localClasses && localClasses.length > 0) {
          await this.localResolverService.transform(
            context,
            ctx,
            localClasses,
            resolvedLocals,
          );
        }
        return response;
      }),
    );
  }
}
