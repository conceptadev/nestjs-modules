import { AppContextHost, APP_CONTEXT_KEY } from './app-context';
import { getAppContext } from './get-app-context.util';

describe('AppContextHost', () => {
  describe('register', () => {
    it('should register a property on the context', () => {
      const ctx = AppContextHost.create<{ operation: string }>();
      ctx.register('operation', 'List');
      expect(ctx.operation).toBe('List');
    });

    it('should allow registering multiple properties', () => {
      const ctx = AppContextHost.create<{
        operation: string;
        action: string;
      }>();
      ctx.register('operation', 'List');
      ctx.register('action', 'read');
      expect(ctx.operation).toBe('List');
      expect(ctx.action).toBe('read');
    });

    it('should throw when registering the same key twice', () => {
      const ctx = AppContextHost.create<{ operation: string }>();
      ctx.register('operation', 'List');
      expect(() => ctx.register('operation', 'Create')).toThrow(
        'Cannot overwrite read-only property: "operation"',
      );
    });

    it('should make properties read-only', () => {
      const ctx = AppContextHost.create<{ operation: string }>();
      ctx.register('operation', 'List');

      // In strict mode, assignment to read-only property throws
      expect(() => {
        (ctx as { operation: string }).operation = 'Update';
      }).toThrow(TypeError);
      expect(ctx.operation).toBe('List');
    });

    it('should make properties enumerable for spread operator', () => {
      const ctx = AppContextHost.create<{
        operation: string;
        action: string;
      }>();
      ctx.register('operation', 'List');
      ctx.register('action', 'read');

      const spread = { ...ctx };
      expect(spread).toEqual({ operation: 'List', action: 'read' });
    });

    it('should return this for chaining', () => {
      const ctx = AppContextHost.create<{
        operation: string;
        action: string;
      }>();
      const result = ctx.register('operation', 'List');
      expect(result).toBe(ctx);
    });
  });

  describe('has', () => {
    it('should return false for unregistered keys', () => {
      const ctx = AppContextHost.create<{ test: string }>();
      expect(ctx.has('test')).toBe(false);
    });

    it('should return true for registered keys', () => {
      const ctx = AppContextHost.create<{ test: string }>();
      ctx.register('test', 'value');
      expect(ctx.has('test')).toBe(true);
    });
  });

  describe('constructor with initial values', () => {
    it('should accept initial values', () => {
      const ctx = AppContextHost.create({ foo: 'bar', num: 42 });
      expect(ctx.foo).toBe('bar');
      expect(ctx.num).toBe(42);
    });

    it('should allow spreading initial values', () => {
      const ctx = AppContextHost.create({ foo: 'bar', num: 42 });
      expect({ ...ctx }).toEqual({ foo: 'bar', num: 42 });
    });
  });

  describe('nested objects', () => {
    it('should allow mutation of nested objects', () => {
      const ctx = AppContextHost.create<{ locals: Record<string, unknown> }>();
      ctx.register('locals', {});
      ctx.locals.tenantId = 'abc';
      expect(ctx.locals.tenantId).toBe('abc');
    });

    it('should not allow reassigning the nested object reference', () => {
      const ctx = AppContextHost.create<{ locals: Record<string, unknown> }>();
      ctx.register('locals', { original: true });

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
