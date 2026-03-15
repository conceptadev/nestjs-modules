import { Provider, Type } from '@nestjs/common';

import {
  UserEntityInterface,
  getDynamicRepositoryToken,
  RepositoryInterface,
} from '@concepta/nestjs-common';

import { UserRepositoryInterface } from '../../domain/repositories/user-repository.interface';
import { USER_REPOSITORY_TOKEN } from '../../user.constants';
import { UserRepository } from '../persistence/user.repository';

export function createUserRepositoryProvider(
  entityKey: string,
  customRepository?: Type<UserRepositoryInterface>,
): Provider[] {
  if (customRepository) {
    return [{ provide: USER_REPOSITORY_TOKEN, useClass: customRepository }];
  }

  return [
    {
      provide: USER_REPOSITORY_TOKEN,
      inject: [getDynamicRepositoryToken(entityKey)],
      useFactory: (repository: RepositoryInterface<UserEntityInterface>) => {
        return new UserRepository(repository);
      },
    },
  ];
}
