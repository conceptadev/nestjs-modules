import { RepositoryContextInterface } from '../interfaces/repository-context.interface';
import { switchToRepo } from '../switch-to-repo';

function createCtx(
  overrides: Partial<RepositoryContextInterface> = {},
): RepositoryContextInterface {
  return {
    hooks: [],
    ...overrides,
  } as RepositoryContextInterface;
}

describe('switchToRepo', () => {
  describe('first call (entity not yet set)', () => {
    it('should set entity on the context and return it', () => {
      const ctx = createCtx();
      const result = switchToRepo(ctx, 'UserEntity');
      expect(result).toBe(ctx);
      expect(result.entity).toBe('UserEntity');
    });

    it('should preserve existing hooks', () => {
      const hooks = [{ type: 'repo', hook: class {} }];
      const ctx = createCtx({
        hooks,
      } as unknown as Partial<RepositoryContextInterface>);
      switchToRepo(ctx, 'UserEntity');
      expect(ctx.hooks).toBe(hooks);
    });

    it('should prevent direct assignment to entity', () => {
      const ctx = createCtx();
      switchToRepo(ctx, 'UserEntity');
      expect(() => {
        (ctx as { entity: string }).entity = 'Other';
      }).toThrow(TypeError);
    });
  });

  describe('subsequent call (entity already set)', () => {
    it('should return a new overlay, not the original', () => {
      const ctx = createCtx();
      switchToRepo(ctx, 'UserEntity');
      const overlay = switchToRepo(ctx, 'CredentialEntity');
      expect(overlay).not.toBe(ctx);
    });

    it('should shadow entity on the overlay', () => {
      const ctx = createCtx();
      switchToRepo(ctx, 'UserEntity');
      const overlay = switchToRepo(ctx, 'CredentialEntity');
      expect(overlay.entity).toBe('CredentialEntity');
    });

    it('should leave the original entity unchanged', () => {
      const ctx = createCtx();
      switchToRepo(ctx, 'UserEntity');
      switchToRepo(ctx, 'CredentialEntity');
      expect(ctx.entity).toBe('UserEntity');
    });

    it('should inherit hooks from the original via prototype chain', () => {
      const hooks = [{ type: 'repo', hook: class {} }];
      const ctx = createCtx({
        hooks,
      } as unknown as Partial<RepositoryContextInterface>);
      switchToRepo(ctx, 'UserEntity');
      const overlay = switchToRepo(ctx, 'CredentialEntity');
      expect(overlay.hooks).toBe(hooks);
    });

    it('should support chained overlays', () => {
      const ctx = createCtx();
      switchToRepo(ctx, 'UserEntity');
      const overlay1 = switchToRepo(ctx, 'CredentialEntity');
      const overlay2 = switchToRepo(overlay1, 'AnotherEntity');
      expect(overlay2.entity).toBe('AnotherEntity');
      expect(overlay1.entity).toBe('CredentialEntity');
      expect(ctx.entity).toBe('UserEntity');
    });
  });
});
