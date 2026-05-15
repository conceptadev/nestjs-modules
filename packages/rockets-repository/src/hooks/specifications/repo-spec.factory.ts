import { SpecificationInterface } from '@concepta/rockets-app';

import { EntitySpecification } from './entity.specification';

/**
 * Factory for creating repository-specific specifications.
 *
 * @example
 * ```typescript
 * @RepoHook()
 * export class UserScopeHook {
 *   @BeforeFindOne(RepoSpec.isEntity('user-credentials'))
 *   scopeToUser(options, ctx) { ... }
 * }
 * ```
 */
export const RepoSpec = {
  /**
   * Matches when the repository entity matches the given name.
   */
  isEntity: (entityName: string): SpecificationInterface =>
    new EntitySpecification(entityName),
};
