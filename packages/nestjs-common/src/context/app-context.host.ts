import { PlainLiteralObject } from '@nestjs/common';

import { HookWithSpec } from '../hooks/hook.types';

import { ContextMergeException } from './exceptions/context-merge.exception';
import {
  AppContextInterface,
  AppContextMergeInterface,
} from './interfaces/app-context.interface';
import { RepositoryContextInterface } from './interfaces/repository-context.interface';
import { isAppContext } from './is-app-context.util';

/**
 * Symbol key used to store the context on the request object.
 */
export const APP_CONTEXT_KEY = Symbol('APP_CONTEXT_KEY');

/**
 * Per-request context container with type-safe, immutable properties.
 *
 * Properties registered via {@link register} are read-only and enumerable,
 * allowing safe use with the spread operator while preventing accidental mutation.
 *
 * @example
 * ```typescript
 * const ctx = AppContextHost.merge<MyContext>(() => ({
 *   auth: { userId: '456' },
 * }));
 *
 * AppContextHost.merge((has) => ({
 *   ...(!has('trx') && { trx: manager }),
 * }), existingCtx);
 * ```
 */
export class AppContextHost<T extends PlainLiteralObject = PlainLiteralObject>
  implements AppContextInterface<T>
{
  /** Set at runtime via {@link switchToRepo} or {@link register}. */
  declare entity: string;
  /** Set at runtime via {@link switchToRepo} or {@link register}. */
  declare hooks: HookWithSpec[];

  /**
   * Check if a property has been registered.
   */
  has(key: keyof T): boolean {
    return key in this;
  }

  /**
   * Set or switch the repository entity on this context.
   *
   * - **First call** (entity not yet set): sets entity directly on this
   *   context and initializes `hooks` to `[]` if absent. Returns `this`.
   * - **Subsequent calls** (entity already set): returns a prototype-chain
   *   overlay (`Object.create(this)`) that shadows only `entity`.
   *   The original context is never mutated.
   */
  switchToRepo(entity: string): RepositoryContextInterface {
    if ('entity' in this) {
      const overlay = Object.create(this);
      Object.defineProperty(overlay, 'entity', {
        value: entity,
        enumerable: true,
        configurable: false,
        writable: false,
      });
      return overlay as RepositoryContextInterface;
    }

    Object.defineProperty(this, 'entity', {
      value: entity,
      enumerable: true,
      configurable: false,
      writable: false,
    });

    if (!('hooks' in this)) {
      Object.defineProperty(this, 'hooks', {
        value: [],
        enumerable: true,
        configurable: false,
        writable: false,
      });
    }

    return this as RepositoryContextInterface;
  }

  /**
   * Register a read-only property on the context.
   */
  register<K extends keyof T & string>(
    key: K,
    value: T[K],
  ): this & Record<K, T[K]> {
    if (this.has(key)) {
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
   * Create or populate a context via a synchronous factory.
   *
   * @param factory - Receives `has` checker, returns properties to register
   * @param ctx - Existing context or plain object to merge into
   */
  static merge<T extends PlainLiteralObject>(
    factory: (has: (key: keyof T) => boolean) => Partial<T>,
    ctx?: AppContextInterface<T> | Partial<T>,
  ): AppContextInterface<T> & T {
    const context = this.lift<T>(ctx);
    return this.apply(
      context,
      factory((k) => context.has(k)),
    );
  }

  /**
   * Create or populate a context via an async factory.
   *
   * @param factory - Receives `has` checker, returns properties to register
   * @param ctx - Existing context or plain object to merge into
   */
  static async mergeAsync<T extends PlainLiteralObject>(
    factory: (
      has: (key: keyof T) => boolean,
    ) => Partial<T> | Promise<Partial<T>>,
    ctx?: AppContextInterface<T> | Partial<T>,
  ): Promise<AppContextInterface<T> & T> {
    const context = this.lift<T>(ctx);
    const props = await factory((k) => context.has(k));
    return this.apply(context, props);
  }

  /** Resolve or create a Host instance, promoting plain objects. */
  private static lift<T extends PlainLiteralObject>(
    ctx?: AppContextInterface<T> | Partial<T>,
  ): AppContextInterface<T> {
    if (isAppContext(ctx)) return ctx;

    const host = new AppContextHost<T>();
    if (ctx) {
      Object.entries(ctx).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          host.register(key, value);
        }
      });
    }
    return host;
  }

  /** Register factory-produced properties, throwing on null/undefined values. */
  private static apply<T extends PlainLiteralObject>(
    context: AppContextInterface<T>,
    props: Partial<T>,
  ): AppContextInterface<T> & T {
    for (const key in props) {
      if (context.has(key)) continue;

      const value = props[key];

      if (value === undefined || value === null) {
        throw new ContextMergeException(key);
      }

      context.register(key, value);
    }
    return context as AppContextInterface<T> & T;
  }
}

AppContextHost satisfies AppContextMergeInterface;
