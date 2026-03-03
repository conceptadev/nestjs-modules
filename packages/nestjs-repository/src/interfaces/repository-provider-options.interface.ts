import { Type, PlainLiteralObject } from '@nestjs/common';

import { RelationAction } from '@concepta/nestjs-common';

/**
 * Per-relation action configuration for onDelete / onUpdate behavior.
 *
 * Currently only 'delegate' is supported (defer to native schema).
 * The type will expand as more actions are implemented.
 */
export interface RelationActionConfig {
  onDelete?: Extract<RelationAction, 'delegate'>;
  onUpdate?: Extract<RelationAction, 'delegate'>;
}

/**
 * Options for registering a repository provider.
 * Repository modules may extend this with driver-specific options.
 */
export interface RepositoryProviderOptions<
  Entity extends PlainLiteralObject = PlainLiteralObject,
> {
  /**
   * String key used as injection token.
   * Used with `@InjectDynamicRepository('key')`.
   */
  key: string;

  /**
   * Entity class.
   */
  entity: Type<Entity>;

  /**
   * Per-relation action config (onDelete / onUpdate).
   * Keyed by relation property name on the entity.
   */
  relations?: Record<string, RelationActionConfig>;

  /**
   * Additional driver-specific options.
   */
  [key: string]: unknown;
}
