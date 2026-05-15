import { Provider, Type } from '@nestjs/common';

import {
  getDynamicRepositoryToken,
  RepositoryInterface,
} from '@concepta/rockets-repository';

import { RoleAssignmentEntityInterface } from '../../domain/interfaces/role-assignment-entity.interface';
import { RoleAssignmentRepositoryInterface } from '../../domain/repositories/role-assignment-repository.interface';
import { ROLE_ASSIGNMENT_CUSTOM_REPOSITORY_TOKEN } from '../../role.constants';
import { RoleAssignmentMapper } from '../persistence/role-assignment.mapper';
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
      RoleAssignmentMapper,
      { token: ROLE_ASSIGNMENT_CUSTOM_REPOSITORY_TOKEN, optional: true },
    ],
    useFactory: (
      repository: RepositoryInterface<RoleAssignmentEntityInterface>,
      mapper: RoleAssignmentMapper,
      customRepo?: Type<RoleAssignmentRepositoryInterface>,
    ) => {
      const RepoClass = customRepo ?? RoleAssignmentRepository;
      return new RepoClass(repository, mapper);
    },
  };
}
