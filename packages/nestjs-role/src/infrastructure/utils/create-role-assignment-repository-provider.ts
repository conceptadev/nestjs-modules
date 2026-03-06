import { Provider } from '@nestjs/common';

import {
  RoleAssignmentEntityInterface,
  getDynamicRepositoryToken,
  RepositoryInterface,
} from '@concepta/nestjs-common';

import { RoleAssignmentRepository } from '../persistence/role-assignment.repository';

/**
 * Generates a dynamic repository token for a given Role Assignment entity key.
 *
 * @param entityKey - Entity key to generate the repository token for
 */
export function getDynamicRoleAssignmentRepositoryToken(
  entityKey: string,
): string {
  return `ROLE_ASSIGNMENT_REPOSITORY_${entityKey.toUpperCase()}`;
}

export function createRoleAssignmentRepositoryProvider(
  entityKey: string,
): Provider {
  return {
    provide: getDynamicRoleAssignmentRepositoryToken(entityKey),
    inject: [getDynamicRepositoryToken(entityKey)],
    useFactory: (
      repository: RepositoryInterface<RoleAssignmentEntityInterface>,
    ) => {
      return new RoleAssignmentRepository(repository);
    },
  };
}
