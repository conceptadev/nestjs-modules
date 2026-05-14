import { PlainLiteralObject, Type } from '@nestjs/common';

import { SpecificationInterface } from './interfaces/specification.interface';

/**
 * Normalized hook configuration with hook class and optional specification.
 * Stored on context and in registry.
 */
export interface HookWithSpec<
  Ctx extends PlainLiteralObject = PlainLiteralObject,
> {
  hook: Type;
  type?: string;
  spec?: SpecificationInterface<Ctx>;
}

/**
 * Configuration for a hook registration.
 * Can be a hook class directly or a HookWithSpec object with spec override.
 */
export type HookOption<Ctx extends PlainLiteralObject = PlainLiteralObject> =
  | Type
  | HookWithSpec<Ctx>;
