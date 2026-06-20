import { PlainLiteralObject } from '@nestjs/common';

import { OverlayRef } from '../overlay-ref';
import { RefsToMethods } from '../refs-to-methods.type';

export interface AppContextInterface {
  defineOverlay<Name extends string, Props extends PlainLiteralObject>(
    ref: OverlayRef<Name, Props, unknown[]>,
    values: Props,
  ): void;

  require<R extends OverlayRef<string, PlainLiteralObject, unknown[]>[]>(
    ...refs: R
  ): this & RefsToMethods<R[number]>;

  with<
    Name extends string,
    Props extends PlainLiteralObject,
    Args extends unknown[],
  >(
    ref: OverlayRef<Name, Props, Args>,
    ...args: Args
  ): Props;

  supports(ref: OverlayRef<string, PlainLiteralObject, unknown[]>): boolean;

  optional(): Record<string, () => this>;
}
