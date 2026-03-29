import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import {
  ContextOverlayInterface,
  getAppContext,
  OverlayRef,
} from '@concepta/nestjs-common';

import {
  CACHE_NAMESPACE_KEY,
  CacheNamespaceOptions,
} from './decorators/cache-namespace.decorator';
import { CacheContextInterface } from './interfaces/cache-context.interface';

export const CacheCtx = new OverlayRef<'withCache', CacheContextInterface>(
  'withCache',
);

@Injectable()
export class CacheContextOverlay
  implements ContextOverlayInterface<'withCache', CacheContextInterface>
{
  readonly ref = CacheCtx;

  constructor(private readonly reflector: Reflector) {}

  resolve(context: ExecutionContext): CacheContextInterface {
    const options = this.reflector.getAllAndOverride<CacheNamespaceOptions>(
      CACHE_NAMESPACE_KEY,
      [context.getHandler(), context.getClass()],
    );
    return { namespace: options?.name ?? '' };
  }

  attach(context: ExecutionContext): void {
    const request = context.switchToHttp().getRequest();
    const ctx = getAppContext(request);
    ctx.defineOverlay(this, context);
  }
}
