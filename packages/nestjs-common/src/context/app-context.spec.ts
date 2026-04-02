import { AppContextLike } from './app-context-like.type';
import { AppContextHost, APP_CONTEXT_KEY } from './app-context.host';
import { OverlayNotDefinedException } from './exceptions/overlay-not-defined.exception';
import { getAppContext } from './get-app-context.util';
import { OverlayRef } from './overlay-ref';

const FooRef = new OverlayRef<'withFoo', { foo: string }>('withFoo');
const BarRef = new OverlayRef<'withBar', { bar: number }>('withBar');

describe('AppContextHost', () => {
  describe('defineOverlay', () => {
    it('should define a callable method on the instance', () => {
      const ctx = new AppContextHost();
      ctx.defineOverlay(FooRef, { foo: 'bar' });
      expect(typeof (ctx as unknown as Record<string, unknown>).withFoo).toBe(
        'function',
      );
    });

    it('should be idempotent when name already exists', () => {
      const ctx = new AppContextHost();
      ctx.defineOverlay(FooRef, { foo: 'first' });
      ctx.defineOverlay(FooRef, { foo: 'second' });
      expect(ctx.with(FooRef).foo).toBe('first');
    });

    it('should not be enumerable', () => {
      const ctx = new AppContextHost();
      ctx.defineOverlay(FooRef, { foo: 'bar' });
      expect({ ...ctx }).toEqual({});
    });

    it('should keep overlays independent per instance', () => {
      const ctx1 = new AppContextHost();
      const ctx2 = new AppContextHost();
      ctx1.defineOverlay(FooRef, { foo: 'bar' });
      expect(ctx2.supports(FooRef)).toBe(false);
    });

    it('should work alongside other overlays', () => {
      const ctx = new AppContextHost();
      ctx.defineOverlay(FooRef, { foo: 'overlay' });
      ctx.defineOverlay(BarRef, { bar: 99 });
      expect(ctx.with(FooRef).foo).toBe('overlay');
      expect(ctx.with(BarRef).bar).toBe(99);
    });
  });

  describe('with', () => {
    it('should return the resolved overlay props', () => {
      const ctx = new AppContextHost();
      ctx.defineOverlay(FooRef, { foo: 'bar' });
      expect(ctx.with(FooRef)).toEqual({ foo: 'bar' });
    });

    it('should throw OverlayNotDefinedException if not defined', () => {
      const ctx = new AppContextHost();
      expect(() => ctx.with(FooRef)).toThrow(OverlayNotDefinedException);
    });
  });

  describe('require', () => {
    it('should return this for chaining', () => {
      const ctx = new AppContextHost();
      ctx.defineOverlay(FooRef, { foo: 'bar' });
      const typed = ctx.require(FooRef);
      expect(typed).toBe(ctx);
    });

    it('should provide typed access to overlay methods', () => {
      const ctx = new AppContextHost();
      ctx.defineOverlay(FooRef, { foo: 'bar' });
      const typed = ctx.require(FooRef);
      expect(typed.withFoo().foo).toBe('bar');
    });
  });

  describe('supports', () => {
    it('should return false for undefined overlays', () => {
      const ctx = new AppContextHost();
      expect(ctx.supports(FooRef)).toBe(false);
    });

    it('should return true for defined overlays', () => {
      const ctx = new AppContextHost();
      ctx.defineOverlay(FooRef, { foo: 'bar' });
      expect(ctx.supports(FooRef)).toBe(true);
    });
  });

  describe('proxy guard', () => {
    it('should throw OverlayNotDefinedException for undefined with* access', () => {
      const ctx = new AppContextHost();
      expect(() =>
        (ctx as never as Record<string, CallableFunction>).withFoo(),
      ).toThrow(OverlayNotDefinedException);
    });

    it('should not throw for non-with* property access', () => {
      const ctx = new AppContextHost();
      expect(
        (ctx as unknown as Record<string, unknown>).something,
      ).toBeUndefined();
    });
  });

  describe('optional', () => {
    it('should return resolved overlay when defined', () => {
      const ctx = new AppContextHost();
      ctx.defineOverlay(FooRef, { foo: 'bar' });
      const result = ctx.optional().withFoo() as unknown as { foo: string };
      expect(result.foo).toBe('bar');
    });

    it('should return ctx when overlay is not defined', () => {
      const ctx = new AppContextHost();
      const result = ctx.optional().withFoo();
      expect(result).toBe(ctx);
    });
  });

  describe('independent overlay access', () => {
    it('should access each overlay independently via require', () => {
      const ctx = new AppContextHost();
      ctx.defineOverlay(FooRef, { foo: 'hello' });
      ctx.defineOverlay(BarRef, { bar: 42 });

      const typed = ctx.require(FooRef, BarRef);
      expect(typed.withFoo().foo).toBe('hello');
      expect(typed.withBar().bar).toBe(42);
    });

    it('should isolate same-named props across overlays', () => {
      const RefA = new OverlayRef<'withA', { namespace: string }>('withA');
      const RefB = new OverlayRef<'withB', { namespace: string }>('withB');

      const ctx = new AppContextHost();
      ctx.defineOverlay(RefA, { namespace: 'cache' });
      ctx.defineOverlay(RefB, { namespace: 'role' });

      expect(ctx.with(RefA).namespace).toBe('cache');
      expect(ctx.with(RefB).namespace).toBe('role');
    });
  });

  describe('from', () => {
    it('should return existing AppContextHost as-is', () => {
      const ctx = new AppContextHost();
      expect(AppContextHost.from(ctx)).toBe(ctx);
    });

    it('should return new AppContextHost for undefined', () => {
      const ctx = AppContextHost.from(undefined);
      expect(ctx).toBeInstanceOf(AppContextHost);
    });

    it('should return new AppContextHost for null', () => {
      const ctx = AppContextHost.from(null);
      expect(ctx).toBeInstanceOf(AppContextHost);
    });

    it('should return new AppContextHost for empty object', () => {
      const ctx = AppContextHost.from({});
      expect(ctx).toBeInstanceOf(AppContextHost);
    });

    it('should throw for non-empty non-AppContextHost object', () => {
      expect(() =>
        AppContextHost.from({ foo: 'bar' } as AppContextLike),
      ).toThrow('Expected AppContextHost or nullish value');
    });
  });
});

describe('getAppContext', () => {
  it('should create a new context on first access', () => {
    const req = { query: {} };
    const ctx = getAppContext(req);
    expect(ctx).toBeInstanceOf(AppContextHost);
  });

  it('should return the same context on subsequent access', () => {
    const req = { query: {} };
    const ctx1 = getAppContext(req);
    const ctx2 = getAppContext(req);
    expect(ctx1).toBe(ctx2);
  });

  it('should preserve overlays across accesses', () => {
    const req = { query: {} };
    const ctx1 = getAppContext(req);
    ctx1.defineOverlay(FooRef, { foo: '123' });

    const ctx2 = getAppContext(req);
    expect(ctx2.with(FooRef).foo).toBe('123');
  });

  it('should store context using APP_CONTEXT_KEY symbol', () => {
    const req: Record<string | symbol, unknown> = { query: {} };
    const ctx = getAppContext(req);
    expect(req[APP_CONTEXT_KEY]).toBe(ctx);
  });
});
