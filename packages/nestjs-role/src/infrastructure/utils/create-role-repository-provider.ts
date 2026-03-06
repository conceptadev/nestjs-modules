import { Provider } from '@nestjs/common';

import {
  RoleEntityInterface,
  getDynamicRepositoryToken,
  RepositoryInterface,
} from '@concepta/nestjs-common';

import { RoleRepository } from '../persistence/role.repository';

/**
 * Generates a dynamic repository token for a given Role entity key.
 *
 * @param entityKey - Entity key to generate the repository token for
 */
export function getDynamicRoleRepositoryToken(entityKey: string): string {
  return `ROLE_REPOSITORY_${entityKey.toUpperCase()}`;
}

export function createRoleRepositoryProvider(entityKey: string): Provider {
  return {
    provide: getDynamicRoleRepositoryToken(entityKey),
    inject: [getDynamicRepositoryToken(entityKey)],
    useFactory: (repository: RepositoryInterface<RoleEntityInterface>) => {
      return new RoleRepository(repository);
    },
  };
}
