import { Observable } from 'rxjs';

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import {
  HookOption,
  HookWithSpec,
  HookContextInterface,
  getAppContext,
} from '@concepta/nestjs-common';

import { HOOK_METADATA_KEY, HOOKS_METADATA_KEY } from './hook.constants';
import { HookMetadataInterface } from './hook.interfaces';

/**
 * Interceptor that gathers hooks from `@UseHooks` decorators and attaches them to the request.
 *
 * Hook classes are discovered via metadata and must be registered as providers.
 * The `@UseHooks` decorator specifies which hooks to apply to each route.
 */
@Injectable()
export class HookInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const ctx = getAppContext<HookContextInterface>(request);

    // Don't re-process if already done
    if (ctx.has('hooks')) {
      return next.handle();
    }

    // Get hooks from @UseHooks decorator (class + method level, merged)
    const decoratorHooks = this.reflector.getAllAndMerge<HookOption[]>(
      HOOKS_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );

    const hooks: HookWithSpec[] = decoratorHooks.map((option) =>
      this.normalizeOption(option),
    );

    // Register hooks on the aggregated context
    ctx.register('hooks', hooks);

    return next.handle();
  }

  /**
   * Normalize a HookOption to HookWithSpec, including hook type from metadata.
   */
  private normalizeOption(option: HookOption): HookWithSpec {
    const hook = typeof option === 'function' ? option : option.hook;
    const specOverride = typeof option === 'function' ? undefined : option.spec;

    // Get hook type from @Hook metadata
    const metadata = this.reflector.get<HookMetadataInterface>(
      HOOK_METADATA_KEY,
      hook,
    );

    return {
      hook,
      type: metadata?.type,
      spec: specOverride,
    };
  }
}
