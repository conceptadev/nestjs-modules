import { ExecutionContext, PlainLiteralObject } from '@nestjs/common';

import { CrudContextInterface } from './crud-context.interface';

/**
 * Interface for CrudLocal resolver instances (the instantiated object).
 * Defines the resolve method that returns data to be stored in locals.
 */
export interface CrudLocalInterface<
  T extends PlainLiteralObject = PlainLiteralObject,
> {
  /**
   * Resolve local data for the current request.
   *
   * @param context - NestJS ExecutionContext (access to request, response, user, etc.)
   * @param crudContext - The built CrudContext with parsed params and current locals
   * @returns The value to store in locals[KEY]
   */
  resolve<Entity extends PlainLiteralObject = PlainLiteralObject>(
    context: ExecutionContext,
    crudContext: CrudContextInterface<Entity>,
  ): Promise<T>;
}

/**
 * Interface for CrudLocal resolver classes (the class itself).
 * This is what users pass to CrudLocals decorator.
 * Enforces the static KEY property on the class.
 */
export interface CrudLocal<T extends PlainLiteralObject = PlainLiteralObject> {
  /**
   * The key used to store this resolver's result in locals.
   * Must be unique across all CrudLocal resolvers for a given route.
   */
  readonly KEY: string;

  /**
   * Constructor signature for DI instantiation.
   */
  new (...args: unknown[]): CrudLocalInterface<T>;
}
