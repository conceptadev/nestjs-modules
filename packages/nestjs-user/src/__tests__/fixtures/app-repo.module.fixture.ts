import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RepositoryModule } from '@concepta/nestjs-repository';
import { TypeOrmRepositoryModule } from '@concepta/nestjs-repository-typeorm';

import { createUserCredentialsRepositoryProvider } from '../../infrastructure/utils/create-user-credentials-repository-provider';
import { createUserRepositoryProvider } from '../../infrastructure/utils/create-user-repository-provider';

import { UserCredentialEntityFixture } from './entities/user-credential.entity.fixture';
import { UserEntityFixture } from './entities/user.entity.fixture';
import { ormConfig } from './ormconfig.fixture';

const USER_ENTITY_KEY = 'user';
const USER_CREDENTIALS_ENTITY_KEY = 'user-credentials';

@Module({
  imports: [
    TypeOrmModule.forRoot(ormConfig),
    RepositoryModule.forRoot({}),
    RepositoryModule.forFeature({
      module: TypeOrmRepositoryModule,
      entities: [
        { key: USER_ENTITY_KEY, entity: UserEntityFixture },
        {
          key: USER_CREDENTIALS_ENTITY_KEY,
          entity: UserCredentialEntityFixture,
        },
      ],
    }),
  ],
  providers: [
    ...createUserRepositoryProvider(USER_ENTITY_KEY),
    ...createUserCredentialsRepositoryProvider(USER_CREDENTIALS_ENTITY_KEY),
  ],
})
export class AppRepoModuleFixture {}
