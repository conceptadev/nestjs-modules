import { Provider, Type } from '@nestjs/common';

import {
  UserCredentialEntityInterface,
  getDynamicRepositoryToken,
  RepositoryInterface,
} from '@concepta/nestjs-common';

import { UserCredentialsRepositoryInterface } from '../../domain/repositories/user-credentials-repository.interface';
import { USER_CREDENTIALS_REPOSITORY_TOKEN } from '../../user.constants';
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
      ],
      useFactory: (
        repository?: RepositoryInterface<UserCredentialEntityInterface>,
      ) => {
        if (repository) {
          return new UserCredentialsRepository(repository);
        }
        return undefined;
      },
    },
  ];
}
