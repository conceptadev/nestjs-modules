import { Provider, Type } from '@nestjs/common';

import {
  getDynamicRepositoryToken,
  RepositoryInterface,
} from '@concepta/rockets-repository';

import { IdentityRepositoryInterface } from '../../domain/repositories/identity-repository.interface';
import { FEDERATED_MODULE_IDENTITY_REPOSITORY_TOKEN } from '../../federated.constants';
import { IdentityMapper } from '../persistence/identity.mapper';
import { IdentityRepository } from '../persistence/identity.repository';
import { IdentityEntityInterface } from '../persistence/interfaces/identity-entity.interface';

export function createIdentityRepositoryProvider(
  entityKey: string,
  customRepository?: Type<IdentityRepositoryInterface>,
): Provider[] {
  if (customRepository) {
    return [
      {
        provide: FEDERATED_MODULE_IDENTITY_REPOSITORY_TOKEN,
        useClass: customRepository,
      },
    ];
  }

  return [
    {
      provide: FEDERATED_MODULE_IDENTITY_REPOSITORY_TOKEN,
      inject: [getDynamicRepositoryToken(entityKey), IdentityMapper],
      useFactory: (
        repository: RepositoryInterface<IdentityEntityInterface>,
        mapper: IdentityMapper,
      ) => new IdentityRepository(repository, mapper),
    },
  ];
}
