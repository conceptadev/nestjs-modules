import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ContextOverlayInterface } from '@concepta/nestjs-common';

import {
  CACHE_NAMESPACE_KEY,
  CacheNamespaceOptions,
} from './decorators/cache-namespace.decorator';
import { CacheContextInterface } from './interfaces/cache-context.interface';

@Injectable()
export class CacheContextOverlay
  implements ContextOverlayInterface<'withCache', CacheContextInterface>
{
  readonly name = 'withCache';

  constructor(private readonly reflector: Reflector) {}

  resolve(context: ExecutionContext): CacheContextInterface {
    const options = this.reflector.getAllAndOverride<CacheNamespaceOptions>(
      CACHE_NAMESPACE_KEY,
      [context.getHandler(), context.getClass()],
    );
    return { namespace: options?.name ?? '' };
  }
}
