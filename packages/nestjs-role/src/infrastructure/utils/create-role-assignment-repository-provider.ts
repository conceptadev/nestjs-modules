import { Provider, Type } from '@nestjs/common';

import {
  RoleAssignmentEntityInterface,
  getDynamicRepositoryToken,
  RepositoryInterface,
} from '@concepta/nestjs-common';

import { RoleAssignmentRepositoryInterface } from '../../domain/repositories/role-assignment-repository.interface';
import { ROLE_ASSIGNMENT_CUSTOM_REPOSITORY_TOKEN } from '../../role.constants';
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
    inject: [
      getDynamicRepositoryToken(entityKey),
      { token: ROLE_ASSIGNMENT_CUSTOM_REPOSITORY_TOKEN, optional: true },
    ],
    useFactory: (
      repository: RepositoryInterface<RoleAssignmentEntityInterface>,
      customRepo?: Type<RoleAssignmentRepositoryInterface>,
    ) => {
      const RepoClass = customRepo ?? RoleAssignmentRepository;
      return new RepoClass(repository);
    },
  };
}
