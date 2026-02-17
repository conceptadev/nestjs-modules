import { Type, PlainLiteralObject } from '@nestjs/common';

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
   * Additional driver-specific options.
   */
  [key: string]: unknown;
}
