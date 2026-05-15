import { Provider, Type } from '@nestjs/common';

import {
  getDynamicRepositoryToken,
  RepositoryInterface,
} from '@concepta/rockets-repository';

import { UserEntityInterface } from '../../domain/interfaces/user-entity.interface';
import { UserRepositoryInterface } from '../../domain/repositories/user-repository.interface';
import { USER_REPOSITORY_TOKEN } from '../../user.constants';
import { UserMapper } from '../persistence/user.mapper';
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
      inject: [getDynamicRepositoryToken(entityKey), UserMapper],
      useFactory: (
        repository: RepositoryInterface<UserEntityInterface>,
        mapper: UserMapper,
      ) => {
        return new UserRepository(repository, mapper);
      },
    },
  ];
}
