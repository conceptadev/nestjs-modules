import { PlainLiteralObject } from '@nestjs/common';

/**
 * Symbol key used to store the context on the request object.
 */
export const APP_CONTEXT_KEY = Symbol('APP_CONTEXT_KEY');

/**
 * Per-request context container with type-safe, immutable properties.
 *
 * Properties registered via `register()` are read-only and enumerable,
 * allowing safe use with the spread operator while preventing accidental mutation.
 *
 * Typically, interceptors register context data early in the request lifecycle,
 * making it available to controllers and services downstream.
 *
 * @example
 * ```typescript
 * // In an interceptor
 * interface MyContext {
 *   auth: { userId: string; tenantId: string };
 * }
 *
 * const ctx = getAppContext<MyContext>(request);
 * ctx.register('auth', { userId: 'user-456', tenantId: 'tenant-123' });
 *
 * // In a controller
 * @Get()
 * getProfile(@Ctx() ctx: TypedAppContext<MyContext>) {
 *   return this.userService.findById(ctx.auth.userId);
 * }
 * ```
 */
export class AppContextHost<T extends PlainLiteralObject = PlainLiteralObject> {
  constructor(initial?: T) {
    if (initial) {
      Object.assign(this, initial);
    }
  }

  /**
   * Check if a property has been registered.
   */
  has(key: keyof T): boolean {
    return key in this;
  }

  /**
   * Register a read-only property on the context.
   */
  register<K extends keyof T & string>(
    key: K,
    value: T[K],
  ): this & Record<K, T[K]> {
    if (key in this) {
      throw new Error(
        `${this.constructor.name} Cannot overwrite read-only property: "${key}"`,
      );
    }

    Object.defineProperty(this, key, {
      value,
      enumerable: true,
      configurable: false,
      writable: false,
    });

    return this as this & Record<K, T[K]>;
  }

  /**
   * Create a typed context instance with optional initial values.
   */
  static create<T extends PlainLiteralObject>(initial?: T): TypedAppContext<T> {
    return new AppContextHost<T>(initial) as TypedAppContext<T>;
  }
}

/**
 * AppContextHost with registered properties accessible as direct properties.
 */
export type TypedAppContext<T extends PlainLiteralObject> = AppContextHost<T> &
  T;
