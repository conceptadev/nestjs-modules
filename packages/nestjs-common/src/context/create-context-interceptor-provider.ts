import {
  InjectionToken,
  PlainLiteralObject,
  Provider,
  Type,
} from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { ContextOverlayInterceptor } from './context-overlay.interceptor';
import { ContextOverlayInterface } from './interfaces/context-overlay.interface';

export function createContextInterceptorProvider<
  Name extends string,
  Props extends PlainLiteralObject,
>(
  overlayClass: Type<ContextOverlayInterface<Name, Props>>,
  token: InjectionToken = APP_INTERCEPTOR,
): Provider {
  return {
    provide: token,
    useFactory: (overlay: ContextOverlayInterface<Name, Props>) =>
      new ContextOverlayInterceptor(overlay),
    inject: [overlayClass],
  };
}
