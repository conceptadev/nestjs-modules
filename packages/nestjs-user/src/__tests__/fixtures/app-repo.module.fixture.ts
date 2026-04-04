import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  CreatePasswordCommand,
  PasswordModule,
  ValidateCurrentPasswordCommand,
  ValidatePasswordHistoryCommand,
} from '@concepta/nestjs-password';
import { RepositoryModule } from '@concepta/nestjs-repository';
import { TypeOrmRepositoryModule } from '@concepta/nestjs-repository-typeorm';

import { UserModule } from '../../user.module';

import { UserCredentialEntityFixture } from './entities/user-credential.entity.fixture';
import { UserEntityFixture } from './entities/user.entity.fixture';
import { ormConfig } from './ormconfig.fixture';

const USER_ENTITY_KEY = 'user';
const USER_CREDENTIALS_ENTITY_KEY = 'user-credentials';

@Module({
  imports: [
    TypeOrmModule.forRoot(ormConfig),
    RepositoryModule.forRoot({}),
    PasswordModule.forRoot({}),
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
    UserModule.forRoot({
      entities: {
        user: USER_ENTITY_KEY,
        credentials: USER_CREDENTIALS_ENTITY_KEY,
      },
      ports: {
        password: {
          createCommand: CreatePasswordCommand,
          validateCurrentCommand: ValidateCurrentPasswordCommand,
          validateHistoryCommand: ValidatePasswordHistoryCommand,
        },
      },
    }),
  ],
})
export class AppRepoModuleFixture {}
