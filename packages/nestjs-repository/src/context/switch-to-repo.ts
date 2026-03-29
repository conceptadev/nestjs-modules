import { PlainLiteralObject } from '@nestjs/common';

import { RepositoryContextInterface } from './interfaces/repository-context.interface';

/**
 * Set or switch the repository entity on a context.
 *
 * - **First call** (entity not yet set): sets entity directly on the context.
 * - **Subsequent calls** (entity already set): returns a prototype-chain
 *   overlay (`Object.create(ctx)`) that shadows only `entity`.
 *   The original context is never mutated.
 */
export function switchToRepo(
  ctx: PlainLiteralObject,
  entity: string,
): RepositoryContextInterface {
  if ('entity' in ctx) {
    const overlay = Object.create(ctx);
    Object.defineProperty(overlay, 'entity', {
      value: entity,
      enumerable: true,
      configurable: false,
      writable: false,
    });
    return overlay as RepositoryContextInterface;
  }

  Object.defineProperty(ctx, 'entity', {
    value: entity,
    enumerable: true,
    configurable: false,
    writable: false,
  });

  return ctx as RepositoryContextInterface;
}
