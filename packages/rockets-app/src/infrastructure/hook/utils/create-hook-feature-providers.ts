import { Provider, Type } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { HookContextOverlay } from '../hook.context.overlay';
import { HookResolverService } from '../hook.resolver.service';

export function createHookFeatureProviders(): Provider[] {
  return [
    HookResolverService,
    HookContextOverlay,
    { provide: APP_INTERCEPTOR, useClass: HookContextOverlay },
  ];
}

export function createHookFeatureExports(): Type[] {
  return [HookResolverService, HookContextOverlay];
}
