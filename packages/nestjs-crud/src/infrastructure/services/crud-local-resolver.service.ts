import { ExecutionContext, Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { AppContextLike } from '@concepta/nestjs-common';

import { CrudContextException } from '../exceptions/crud-context.exception';
import { CrudLocal } from '../interceptors/interfaces/crud-local.interface';

/**
 * Service responsible for resolving CrudLocal providers.
 *
 * Executes CrudLocal resolvers sequentially in array order,
 * returning a frozen object with resolved values keyed by each
 * resolver's static KEY property.
 */
@Injectable()
export class CrudLocalResolverService {
  constructor(private moduleRef: ModuleRef) {}

  /**
   * Resolve CrudLocal providers sequentially, populating the locals target.
   *
   * - Validates KEY uniqueness before execution
   * - Each resolver runs once per request (duplicates skipped)
   * - Values are frozen after being set (immutable)
   *
   * @param context - NestJS ExecutionContext
   * @param ctx - The AppContext (passed to each resolver)
   * @param localClasses - Array of CrudLocal class references
   * @param locals - Target object for resolved values
   */
  async resolve(
    context: ExecutionContext,
    ctx: AppContextLike,
    localClasses: CrudLocal[] | undefined,
    locals: Record<string, unknown> = {},
  ): Promise<void> {
    if (!localClasses || localClasses.length === 0) {
      return;
    }

    // Validate KEY uniqueness
    this.validateUniqueKeys(localClasses);

    // Track which resolvers have already run (by class reference)
    const executedResolvers = new Set<CrudLocal>();

    // Execute resolvers sequentially in array order
    for (const LocalClass of localClasses) {
      // Skip if this resolver has already been executed
      if (executedResolvers.has(LocalClass)) {
        continue;
      }

      const resolver = this.moduleRef.get(LocalClass, { strict: false });
      const result = await resolver.resolve(context, ctx, locals);

      // Freeze the value and make property non-configurable
      Object.defineProperty(locals, LocalClass.KEY, {
        value: Object.freeze(result),
        writable: false,
        enumerable: true,
        configurable: false,
      });

      executedResolvers.add(LocalClass);
    }
  }

  /**
   * Execute transform hooks on CrudLocal providers sequentially.
   *
   * Called after the controller method returns a response.
   * Runs in the same order as resolve.
   *
   * @param context - NestJS ExecutionContext
   * @param ctx - The AppContext with fully resolved locals
   * @param localClasses - Array of CrudLocal class references
   */
  async transform(
    context: ExecutionContext,
    ctx: AppContextLike,
    localClasses: CrudLocal[] | undefined,
    locals: Readonly<Record<string, unknown>>,
  ): Promise<void> {
    if (!localClasses || localClasses.length === 0) {
      return;
    }

    for (const LocalClass of localClasses) {
      const resolver = this.moduleRef.get(LocalClass, { strict: false });
      await resolver.transform(context, ctx, locals);
    }
  }

  /**
   * Validate that all CrudLocal classes have unique KEY values.
   * Throws if duplicate keys are detected.
   */
  private validateUniqueKeys(localClasses: CrudLocal[]): void {
    const keys = new Map<string, string>(); // KEY -> class name
    for (const LocalClass of localClasses) {
      const key = LocalClass.KEY;
      if (keys.has(key)) {
        throw new CrudContextException({
          message: `CrudLocal KEY collision: "${key}" is used by both ${keys.get(key)} and ${LocalClass.name}`,
        });
      }
      keys.set(key, LocalClass.name);
    }
  }
}
