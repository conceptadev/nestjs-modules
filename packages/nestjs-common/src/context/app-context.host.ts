import { ExecutionContext, PlainLiteralObject } from '@nestjs/common';

import { AppContextLike } from './app-context-like.type';
import { OverlayNotDefinedException } from './exceptions/overlay-not-defined.exception';
import { AppContextInterface } from './interfaces/app-context.interface';
import { ContextOverlayInterface } from './interfaces/context-overlay.interface';
import { OverlayRef } from './overlay-ref';
import { RefsToMethods } from './refs-to-methods.type';

/**
 * Symbol key used to store the context on the request object.
 */
export const APP_CONTEXT_KEY = Symbol('APP_CONTEXT_KEY');

// ---------------------------------------------------------------------------
// Proxy handler — intercepts undefined `with*` calls
// ---------------------------------------------------------------------------

const proxyHandler: ProxyHandler<AppContextHost> = {
  get(target, prop, receiver) {
    const value = Reflect.get(target, prop, receiver);
    if (value !== undefined) return value;

    if (typeof prop === 'string' && prop.startsWith('with')) {
      throw new OverlayNotDefinedException(prop);
    }

    return value;
  },
};

/**
 * Per-request context container backed by typed overlays.
 *
 * Overlays are defined eagerly via {@link defineOverlay} and accessed
 * through typed `with*()` methods. The proxy constructor intercepts
 * calls to undefined `with*` methods and throws
 * {@link OverlayNotDefinedException}.
 *
 * @example
 * ```typescript
 * // In an interceptor:
 * const ctx = getAppContext(request);
 * ctx.defineOverlay(this.featureOverlay, context);
 *
 * // In a handler:
 * const typed = ctx.require(WithFeature);
 * const feature = typed.withFeature();
 * ```
 */
export class AppContextHost implements AppContextInterface {
  constructor() {
    return new Proxy(this, proxyHandler);
  }

  /**
   * Define an overlay method on this context instance.
   *
   * The overlay's `resolve()` is called immediately and the result is cached.
   * Subsequent calls to `ctx.<name>()` return a prototype-chain child
   * with the cached values merged in (preserving `instanceof AppContextHost`).
   *
   * Idempotent — if the overlay name already exists on `this`, this is a no-op.
   */
  defineOverlay<Name extends string, Props extends PlainLiteralObject>(
    contextOverlay: ContextOverlayInterface<Name, Props>,
    context?: ExecutionContext,
  ): void {
    const name = contextOverlay.ref.name;

    if (Object.prototype.hasOwnProperty.call(this, name)) return;

    const values = contextOverlay.resolve(context);

    Object.defineProperty(this, name, {
      value: function (this: AppContextHost) {
        return Object.assign(Object.create(this), values);
      },
      enumerable: false,
      configurable: false,
      writable: false,
    });
  }

  /**
   * Define an overlay by ref and pre-resolved values.
   *
   * Convenience shorthand for CLI and testing — skips the
   * `ContextOverlayInterface` ceremony.
   */
  define<Name extends string, Props extends PlainLiteralObject>(
    ref: OverlayRef<Name, Props>,
    values: Props,
  ): void {
    this.defineOverlay({ ref, resolve: () => values, attach: () => {} });
  }

  /**
   * Type-level narrowing gate.
   *
   * Returns `this` cast to include the typed `with*()` methods for the
   * given refs. No runtime validation — the proxy handles undefined overlays.
   */
  require<R extends OverlayRef<string, PlainLiteralObject>[]>(
    ..._refs: R
  ): this & RefsToMethods<R[number]> {
    return this as this & RefsToMethods<R[number]>;
  }

  /**
   * Direct lookup by ref. Returns the resolved overlay props.
   */
  with<Name extends string, Props extends PlainLiteralObject>(
    ref: OverlayRef<Name, Props>,
  ): Props {
    const fn = (this as Record<string, unknown>)[ref.name];

    if (typeof fn !== 'function') {
      throw new OverlayNotDefinedException(ref.name);
    }

    return fn.call(this) as Props;
  }

  /**
   * Check if an overlay is defined on this context.
   */
  supports(ref: OverlayRef<string, PlainLiteralObject>): boolean {
    return ref.name in this;
  }

  /**
   * Returns a proxy where calling any overlay method returns the
   * resolved overlay if defined, or `this` unchanged if not.
   */
  optional(): Record<string, () => this> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    return new Proxy(
      {},
      {
        get(_target, prop: string) {
          return () => {
            try {
              const fn = (self as unknown as Record<string, unknown>)[prop];
              if (typeof fn === 'function') {
                return (fn as () => unknown).call(self);
              }
            } catch {
              // proxy guard threw — overlay not defined, fall through
            }
            return self;
          };
        },
      },
    );
  }

  /**
   * Resolve an `AppContextLike` value to a guaranteed `AppContextHost`.
   *
   * - `AppContextHost` → returns as-is
   * - `undefined`, `null`, or empty `{}` → returns a new `AppContextHost`
   * - Non-empty non-AppContextHost object → throws
   */
  static from(value?: AppContextLike): AppContextHost {
    if (value instanceof AppContextHost) return value;
    if (
      value === undefined ||
      value === null ||
      Object.keys(value).length === 0
    ) {
      return new AppContextHost();
    }
    throw new Error(
      `Expected AppContextHost or nullish value, got ${typeof value}`,
    );
  }
}
