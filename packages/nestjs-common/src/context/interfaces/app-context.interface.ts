import { ExecutionContext, PlainLiteralObject } from '@nestjs/common';

import { OverlayRef } from '../overlay-ref';
import { RefsToMethods } from '../refs-to-methods.type';

import { ContextOverlayInterface } from './context-overlay.interface';

export interface AppContextInterface {
  defineOverlay<Name extends string, Props extends PlainLiteralObject>(
    contextOverlay: ContextOverlayInterface<Name, Props>,
    context?: ExecutionContext,
  ): void;

  define<Name extends string, Props extends PlainLiteralObject>(
    ref: OverlayRef<Name, Props>,
    values: Props,
  ): void;

  require<R extends OverlayRef<string, PlainLiteralObject>[]>(
    ...refs: R
  ): this & RefsToMethods<R[number]>;

  with<Name extends string, Props extends PlainLiteralObject>(
    ref: OverlayRef<Name, Props>,
  ): Props;

  supports(ref: OverlayRef<string, PlainLiteralObject>): boolean;

  optional(): Record<string, () => this>;
}
