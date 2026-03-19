import { Provider, Type } from '@nestjs/common';

import { RoleEntityInterface } from '@concepta/nestjs-common';
import {
  getDynamicRepositoryToken,
  RepositoryInterface,
} from '@concepta/nestjs-repository';

import { RoleRepositoryInterface } from '../../domain/repositories/role-repository.interface';
import { ROLE_CUSTOM_REPOSITORY_TOKEN } from '../../role.constants';
import { RoleMapper } from '../persistence/role.mapper';
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
    inject: [
      getDynamicRepositoryToken(entityKey),
      RoleMapper,
      { token: ROLE_CUSTOM_REPOSITORY_TOKEN, optional: true },
    ],
    useFactory: (
      repository: RepositoryInterface<RoleEntityInterface>,
      mapper: RoleMapper,
      customRepo?: Type<RoleRepositoryInterface>,
    ) => {
      const RepoClass = customRepo ?? RoleRepository;
      return new RepoClass(repository, mapper);
    },
  };
}
