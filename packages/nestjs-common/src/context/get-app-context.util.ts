import { PlainLiteralObject } from '@nestjs/common';

import {
  AppContextHost,
  APP_CONTEXT_KEY,
  TypedAppContext,
} from './app-context';

/**
 * Get or create the application context for a request.
 *
 * Creates a new context on first access; subsequent calls return the same instance.
 * Typically used by interceptors to register context data.
 *
 * @example
 * ```typescript
 * // In an interceptor
 * const ctx = getAppContext<MyContext>(request);
 * ctx.register('auth', { userId: 'user-456', tenantId: 'tenant-123' });
 * ```
 */
export function getAppContext<T extends PlainLiteralObject>(
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  request: any,
): TypedAppContext<T> {
  if (!request[APP_CONTEXT_KEY]) {
    request[APP_CONTEXT_KEY] = new AppContextHost<T>();
  }
  return request[APP_CONTEXT_KEY];
}
