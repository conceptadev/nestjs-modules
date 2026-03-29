import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import {
  ContextOverlayInterface,
  getAppContext,
  HookContextInterface,
  HookOption,
  HookWithSpec,
  OverlayRef,
} from '@concepta/nestjs-common';

import { HOOK_METADATA_KEY, HOOKS_METADATA_KEY } from './hook.constants';
import { HookMetadataInterface } from './hook.interfaces';

export const HooksCtx = new OverlayRef<'withHooks', HookContextInterface>(
  'withHooks',
);

@Injectable()
export class HookContextOverlay
  implements ContextOverlayInterface<'withHooks', HookContextInterface>
{
  readonly ref = HooksCtx;

  constructor(private readonly reflector: Reflector) {}

  resolve(context: ExecutionContext): HookContextInterface {
    const decoratorHooks = this.reflector.getAllAndMerge<HookOption[]>(
      HOOKS_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );

    const hooks: HookWithSpec[] = decoratorHooks.map((option) =>
      this.normalizeOption(option),
    );

    return { hooks };
  }

  attach(context: ExecutionContext): void {
    const request = context.switchToHttp().getRequest();
    const ctx = getAppContext(request);
    ctx.defineOverlay(this, context);
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
