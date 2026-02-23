import {
  ExecutionContext,
  Injectable,
  PlainLiteralObject,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { CrudContextException } from '../../domain/exceptions/crud-context.exception';
import { CrudContextInterface } from '../interceptors/interfaces/crud-context.interface';
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
   * Resolve CrudLocal providers sequentially, populating crudContext.locals.
   *
   * - Validates KEY uniqueness before execution
   * - Each resolver runs once per request (duplicates skipped)
   * - Values are frozen after being set (immutable)
   * - Each resolver can access results from prior resolvers via crudContext.locals
   *
   * @param context - NestJS ExecutionContext
   * @param crudContext - The CrudContext being built (locals will be mutated)
   * @param localClasses - Array of CrudLocal class references
   */
  async resolve<T extends PlainLiteralObject>(
    context: ExecutionContext,
    crudContext: CrudContextInterface<T>,
    localClasses: CrudLocal[] | undefined,
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
      const result = await resolver.resolve(context, crudContext);

      // Freeze the value and make property non-configurable
      Object.defineProperty(crudContext.locals, LocalClass.KEY, {
        value: Object.freeze(result),
        writable: false,
        enumerable: true,
        configurable: false,
      });

      executedResolvers.add(LocalClass);
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
