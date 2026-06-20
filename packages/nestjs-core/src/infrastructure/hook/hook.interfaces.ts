import { HookMethodKeyType } from './decorators/hook-method.decorator';
import { SpecificationInterface } from './interfaces/specification.interface';

/**
 * Hook type decorator with KEY property for subsystem filtering.
 */
export interface HookTypeInterface {
  readonly KEY: string;
}

/**
 * Metadata stored on hook classes via `@Hook` decorator.
 */
export interface HookMetadataInterface {
  type: string;
}

/**
 * Metadata stored for each hook method decorator on a method.
 */
export interface HookMethodMetadataInterface {
  key: HookMethodKeyType;
  spec?: SpecificationInterface;
}

/**
 * Cached method mapping for a hook.
 * Pre-computed at decoration time for O(1) runtime lookup.
 */
export interface HookMethodMapInterface {
  methodName: string;
  metadata: HookMethodMetadataInterface;
  /**
   * Pre-resolved specification for this method.
   * Computed at decoration time following priority:
   * 1. Hook decorator param: `@BeforeFind(spec)`
   * 2. Method-level: `@Specification()` on the method
   * 3. Class-level: `@Specification()` on the class
   * 4. Default: Spec.always()
   */
  resolvedSpec: SpecificationInterface;
  /**
   * Pre-resolved method function from prototype.
   * Stored at decoration time to avoid runtime property lookup.
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  method: Function;
}

/**
 * A resolved hook instance with pre-computed method mappings.
 * The spec here is from the hook config; per-method specs are in HookMethodMapInterface.
 */
export interface ResolvedHook {
  hook: object;
  spec?: SpecificationInterface;
  methods?: Map<HookMethodKeyType, HookMethodMapInterface[]>;
}

/**
 * Options for the `@Hook` decorator.
 */
export interface HookDecoratorOptions {
  type: string | { KEY: string };
  spec?: SpecificationInterface;
}
