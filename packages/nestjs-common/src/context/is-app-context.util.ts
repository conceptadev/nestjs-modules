import { PlainLiteralObject } from '@nestjs/common';

import { AppContextInterface } from './interfaces/app-context.interface';

export function isAppContext<T extends PlainLiteralObject>(
  ctx?: AppContextInterface<T> | Partial<T>,
): ctx is AppContextInterface<T> {
  return ctx !== undefined && 'has' in ctx && 'register' in ctx;
}
