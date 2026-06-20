import { Provider, Type } from '@nestjs/common';

import {
  getDynamicRepositoryToken,
  RepositoryInterface,
} from '@concepta/nestjs-repository';

import { UserCredentialEntityInterface } from '../../domain/interfaces/user-credential-entity.interface';
import { UserCredentialsRepositoryInterface } from '../../domain/repositories/user-credentials-repository.interface';
import { USER_CREDENTIALS_REPOSITORY_TOKEN } from '../../user.constants';
import { UserCredentialsMapper } from '../persistence/user-credentials.mapper';
import { UserCredentialsRepository } from '../persistence/user-credentials.repository';

export function createUserCredentialsRepositoryProvider(
  entityKey?: string,
  customRepository?: Type<UserCredentialsRepositoryInterface>,
): Provider[] {
  if (customRepository) {
    return [
      {
        provide: USER_CREDENTIALS_REPOSITORY_TOKEN,
        useClass: customRepository,
      },
    ];
  }

  if (!entityKey) {
    return [];
  }

  return [
    {
      provide: USER_CREDENTIALS_REPOSITORY_TOKEN,
      inject: [
        {
          token: getDynamicRepositoryToken(entityKey),
          optional: true,
        },
        UserCredentialsMapper,
      ],
      useFactory: (
        repository:
          | RepositoryInterface<UserCredentialEntityInterface>
          | undefined,
        mapper: UserCredentialsMapper,
      ) => {
        if (repository) {
          return new UserCredentialsRepository(repository, mapper);
        }
        return undefined;
      },
    },
  ];
}
