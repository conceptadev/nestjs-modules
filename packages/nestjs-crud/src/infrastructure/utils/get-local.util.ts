import { PlainLiteralObject } from '@nestjs/common';

import { CrudContextInterface } from '../interceptors/interfaces/crud-context.interface';
import { CrudLocal } from '../interceptors/interfaces/crud-local.interface';

function hasLocals(
  ctx: PlainLiteralObject,
): ctx is CrudContextInterface {
  return 'locals' in ctx;
}

/**
 * Type-safe accessor for CrudLocal resolved values.
 *
 * Uses the CrudLocal class reference as a type token to infer the
 * return type from the class generic, avoiding unsafe casts.
 *
 * @param ctx - Context that may carry locals at runtime
 * @param localClass - CrudLocal class reference (provides KEY and type)
 * @returns The frozen resolved value, or undefined if not present
 */
export function getLocal<T extends PlainLiteralObject>(
  ctx: PlainLiteralObject | undefined,
  localClass: CrudLocal<T>,
): Readonly<T> | undefined {
  if (!ctx || !hasLocals(ctx)) return undefined;

  return ctx.locals[localClass.KEY] as Readonly<T> | undefined;
}
