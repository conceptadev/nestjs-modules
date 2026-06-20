import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { OverlayRef } from '../../domain/context/overlay-ref';
import { ContextOverlayInterceptor } from '../context/context-overlay.interceptor';
import { getAppContext } from '../context/get-app-context.util';
import { HookContextInterface } from '../context/interfaces/hook-context.interface';

import { HOOK_METADATA_KEY, HOOKS_METADATA_KEY } from './hook.constants';
import { HookMetadataInterface } from './hook.interfaces';
import { HookOption, HookWithSpec } from './hook.types';

export const HooksCtx = new OverlayRef<'withHooks', HookContextInterface>(
  'withHooks',
);

@Injectable()
export class HookContextOverlay extends ContextOverlayInterceptor {
  readonly ref = HooksCtx;

  constructor(private readonly reflector: Reflector) {
    super();
  }

  attach(context: ExecutionContext): void {
    const request = context.switchToHttp().getRequest();
    const ctx = getAppContext(request);
    const resolved = this.resolve(context);
    ctx.defineOverlay(HooksCtx, resolved);
  }

  private resolve(context: ExecutionContext): HookContextInterface {
    const decoratorHooks = this.reflector.getAllAndMerge<HookOption[]>(
      HOOKS_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );
    const hooks = (decoratorHooks ?? []).map((option) =>
      this.normalizeOption(option),
    );
    return { hooks };
  }

  private normalizeOption(option: HookOption): HookWithSpec {
    const hook = typeof option === 'function' ? option : option.hook;
    const specOverride = typeof option === 'function' ? undefined : option.spec;

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
