import { ExecutionContext, PlainLiteralObject } from '@nestjs/common';

import { AppContextLike } from '@concepta/nestjs-common';

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
   * Called before the controller method executes.
   *
   * @param context - NestJS ExecutionContext (access to request, response, user, etc.)
   * @param ctx - The application context
   * @param locals - The current resolved locals record
   * @returns The value to store in locals[KEY]
   */
  resolve(
    context: ExecutionContext,
    ctx: AppContextLike,
    locals: Readonly<Record<string, unknown>>,
  ): Promise<T>;

  /**
   * Transform hook called after the controller method returns a response.
   *
   * Called in the same order as resolve, after the response is produced.
   * Implementations that do not need response-side behavior should no-op.
   *
   * @param context - NestJS ExecutionContext (access to request, response, user, etc.)
   * @param ctx - The application context
   * @param locals - The fully resolved locals record
   */
  transform(
    context: ExecutionContext,
    ctx: AppContextLike,
    locals: Readonly<Record<string, unknown>>,
  ): Promise<void>;
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
