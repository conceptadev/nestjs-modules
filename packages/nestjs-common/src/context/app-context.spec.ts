import { AppContextHost, APP_CONTEXT_KEY } from './app-context';
import { getAppContext } from './get-app-context.util';

describe('AppContextHost', () => {
  describe('register', () => {
    it('should register a property on the context', () => {
      const ctx = new AppContextHost<{ operation: string }>();
      const typed = ctx.register('operation', 'List');
      expect(typed.operation).toBe('List');
    });

    it('should allow registering multiple properties', () => {
      const ctx = new AppContextHost<{
        operation: string;
        action: string;
      }>();
      const typed = ctx
        .register('operation', 'List')
        .register('action', 'read');
      expect(typed.operation).toBe('List');
      expect(typed.action).toBe('read');
    });

    it('should throw when registering the same key twice', () => {
      const ctx = new AppContextHost<{ operation: string }>();
      ctx.register('operation', 'List');
      expect(() => ctx.register('operation', 'Create')).toThrow(
        'Cannot overwrite read-only property: "operation"',
      );
    });

    it('should make properties read-only', () => {
      const ctx = new AppContextHost<{ operation: string }>();
      const typed = ctx.register('operation', 'List');

      // In strict mode, assignment to read-only property throws
      expect(() => {
        (typed as { operation: string }).operation = 'Update';
      }).toThrow(TypeError);
      expect(typed.operation).toBe('List');
    });

    it('should make properties enumerable for spread operator', () => {
      const ctx = new AppContextHost<{
        operation: string;
        action: string;
      }>();
      ctx.register('operation', 'List');
      ctx.register('action', 'read');

      const spread = { ...ctx };
      expect(spread).toEqual({ operation: 'List', action: 'read' });
    });

    it('should return this for chaining', () => {
      const ctx = new AppContextHost<{
        operation: string;
        action: string;
      }>();
      const result = ctx.register('operation', 'List');
      expect(result).toBe(ctx);
    });
  });

  describe('has', () => {
    it('should return false for unregistered keys', () => {
      const ctx = new AppContextHost<{ test: string }>();
      expect(ctx.has('test')).toBe(false);
    });

    it('should return true for registered keys', () => {
      const ctx = new AppContextHost<{ test: string }>();
      ctx.register('test', 'value');
      expect(ctx.has('test')).toBe(true);
    });
  });

  describe('merge', () => {
    it('should create a new context when ctx is undefined', () => {
      const ctx = AppContextHost.merge<{ foo: string }>(() => ({
        foo: 'bar',
      }));
      expect(ctx.foo).toBe('bar');
    });

    it('should use existing context when provided', () => {
      const existing = new AppContextHost<{ a: string; b: number }>();
      existing.register('a', 'hello');

      const ctx = AppContextHost.merge<{ a: string; b: number }>(
        () => ({ a: 'hello', b: 42 }),
        existing,
      );

      expect(ctx).toBe(existing);
      expect(ctx.a).toBe('hello');
      expect(ctx.b).toBe(42);
    });

    it('should allow factory to return multiple properties', () => {
      const ctx = AppContextHost.merge<{ x: number; y: number }>(() => ({
        x: 1,
        y: 2,
      }));
      expect(ctx.x).toBe(1);
      expect(ctx.y).toBe(2);
    });

    it('should skip keys already on the context', () => {
      const existing = new AppContextHost<{ a: string; b: number }>();
      existing.register('a', 'original');

      const ctx = AppContextHost.merge(
        () => ({ a: 'replaced', b: 42 }),
        existing,
      );

      expect(ctx.a).toBe('original');
      expect(ctx.b).toBe(42);
    });

    it('should pass has() to the factory', () => {
      const existing = new AppContextHost<{ a: string; b: number }>();
      existing.register('a', 'hello');

      const ctx = AppContextHost.merge<{ a: string; b: number }>(
        (has) => ({
          ...(!has('a') && { a: 'replaced' }),
          b: 42,
        }),
        existing,
      );

      expect(ctx.a).toBe('hello');
      expect(ctx.b).toBe(42);
    });

    it('should throw ContextMergeException for undefined values', () => {
      expect(() =>
        AppContextHost.merge<{ foo: string }>(
          () => ({ foo: undefined }) as unknown as { foo: string },
        ),
      ).toThrow('AppContextHost.apply() must provide a value');
    });

    it('should support async factory', async () => {
      const ctx = await AppContextHost.mergeAsync<{ foo: string }>(() => ({
        foo: 'bar',
      }));
      expect(ctx.foo).toBe('bar');
    });

    it('should allow spreading the merged context', () => {
      const ctx = AppContextHost.merge<{ foo: string; num: number }>(() => ({
        foo: 'bar',
        num: 42,
      }));
      expect({ ...ctx }).toEqual({ foo: 'bar', num: 42 });
    });
  });

  describe('nested objects', () => {
    it('should allow mutation of nested objects', () => {
      const ctx = AppContextHost.merge<{ locals: Record<string, unknown> }>(
        () => ({ locals: {} }),
      );
      ctx.locals.tenantId = 'abc';
      expect(ctx.locals.tenantId).toBe('abc');
    });

    it('should not allow reassigning the nested object reference', () => {
      const ctx = AppContextHost.merge<{ locals: Record<string, unknown> }>(
        () => ({ locals: { original: true } }),
      );

      // In strict mode, assignment to read-only property throws
      expect(() => {
        (ctx as { locals: Record<string, unknown> }).locals = {
          replaced: true,
        };
      }).toThrow(TypeError);
      expect(ctx.locals).toEqual({ original: true });
    });
  });
});

describe('getAppContext', () => {
  it('should create a new context on first access', () => {
    const req = { query: {} };
    const ctx = getAppContext<{ params: Record<string, string> }>(req);
    expect(ctx).toBeInstanceOf(AppContextHost);
  });

  it('should return the same context on subsequent access', () => {
    const req = { query: {} };
    const ctx1 = getAppContext(req);
    const ctx2 = getAppContext(req);
    expect(ctx1).toBe(ctx2);
  });

  it('should preserve registered properties across accesses', () => {
    const req = { query: {} };
    const ctx1 = getAppContext<{ params: { id: string } }>(req);
    ctx1.register('params', { id: '123' });

    const ctx2 = getAppContext<{ params: { id: string } }>(req);
    expect(ctx2.params).toEqual({ id: '123' });
  });

  it('should store context using CONTEXT_KEY symbol', () => {
    const req: Record<string | symbol, unknown> = { query: {} };
    const ctx = getAppContext(req);
    expect(req[APP_CONTEXT_KEY]).toBe(ctx);
  });
});
