import { HOOK_METHOD_METADATA_KEY } from '../hook.constants';
import { HookMethodMetadataInterface } from '../hook.interfaces';
import { SpecificationInterface } from '../interfaces/specification.interface';

/**
 * Hook method key type.
 * Subsystems define their own keys (e.g., RepoHookMethodKey.BEFORE_FIND).
 */
export type HookMethodKeyType = string;

/**
 * Creates a hook method decorator for a specific hook key.
 *
 * The returned decorator can be applied to methods in a `@Hook` class.
 * When called with a specification, it overrides the class/method-level spec
 * for this specific hook.
 *
 * Multiple hook decorators can be stacked on the same method.
 *
 * @param key - The hook method key (subsystems define their own keys)
 * @returns A decorator factory that optionally accepts a specification
 *
 * @example
 * ```typescript
 * // Subsystems define their own keys and decorators
 * export const BeforeFind = createHookMethodDecorator(RepoHookMethodKey.BEFORE_FIND);
 * export const AfterCreate = createHookMethodDecorator(RepoHookMethodKey.AFTER_CREATE);
 *
 * // Use without spec (uses class/method-level spec)
 * @BeforeFind()
 * addFilter(options) { ... }
 *
 * // Use with hook-specific spec override
 * @BeforeRemove(Spec.hasRole('admin'))
 * restrictDelete(entity) { ... }
 *
 * // Multiple hooks on same method
 * @BeforeFind()
 * @BeforeFindOne()
 * addTenantFilter(options) { ... }
 * ```
 */
export function createHookMethodDecorator(
  key: HookMethodKeyType,
): (spec?: SpecificationInterface) => MethodDecorator {
  return (spec?: SpecificationInterface): MethodDecorator => {
    return (
      _target: object,
      _propertyKey: string | symbol,
      descriptor: PropertyDescriptor,
    ): PropertyDescriptor => {
      const method = descriptor.value;
      if (!method) {
        return descriptor;
      }

      // Get existing metadata or initialize empty array
      const existing: HookMethodMetadataInterface[] =
        Reflect.getMetadata(HOOK_METHOD_METADATA_KEY, method) ?? [];

      // Add this hook's metadata
      const metadata: HookMethodMetadataInterface = { key, spec };
      Reflect.defineMetadata(
        HOOK_METHOD_METADATA_KEY,
        [...existing, metadata],
        method,
      );

      return descriptor;
    };
  };
}
