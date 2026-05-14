import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CrudCqrsResolver, CrudModule } from '@concepta/nestjs-crud';
import {
  CreatePasswordCommand,
  PasswordModule,
  PasswordUpdateInterface,
  ValidateCurrentPasswordCommand,
  ValidatePasswordHistoryCommand,
} from '@concepta/nestjs-password';
import { RepositoryModule } from '@concepta/nestjs-repository';
import { TypeOrmRepositoryModule } from '@concepta/nestjs-repository-typeorm';
import {
  RocketsAppModule,
  UseHooks,
  ExceptionsFilter,
  Operation,
} from '@concepta/rockets-app';

import { UserCredentialEntityFixture } from '../../../../__tests__/fixtures/entities/user-credential.entity.fixture';
import { UserEntityFixture } from '../../../../__tests__/fixtures/entities/user.entity.fixture';
import { ormConfig } from '../../../../__tests__/fixtures/ormconfig.fixture';
import { UserInterface } from '../../../../domain/interfaces/user.interface';
import { UserPasswordUpdateDto } from '../../../../infrastructure/dtos/password/user-password-update.dto';
import { UserCreateDto } from '../../../../infrastructure/dtos/user-create.dto';
import { UserPaginatedDto } from '../../../../infrastructure/dtos/user-paginated.dto';
import { UserUpdateDto } from '../../../../infrastructure/dtos/user-update.dto';
import { UserDto } from '../../../../infrastructure/dtos/user.dto';
import { UserModule } from '../../../../user.module';
import { CreateUserRequestHandler } from '../../commands/handlers/create-user-request.handler';
import { DeleteUserRequestHandler } from '../../commands/handlers/delete-user-request.handler';
import { UpdateUserPasswordRequestHandler } from '../../commands/handlers/update-user-password-request.handler';
import { UpdateUserRequestHandler } from '../../commands/handlers/update-user-request.handler';
import { CreateUserRequest } from '../../commands/impl/create-user.request';
import { DeleteUserRequest } from '../../commands/impl/delete-user.request';
import { UpdateUserPasswordRequest } from '../../commands/impl/update-user-password.request';
import { UpdateUserRequest } from '../../commands/impl/update-user.request';
import { ListUsersRequestHandler } from '../../queries/handlers/list-users-request.handler';
import { ReadUserRequestHandler } from '../../queries/handlers/read-user-request.handler';
import { ListUsersRequest } from '../../queries/impl/list-users.request';
import { ReadUserRequest } from '../../queries/impl/read-user.request';

import { AuthorizedUserOverlayFixture } from './authorized-user.local.fixture';
import { FakeAuthInterceptorFixture } from './fake-auth.interceptor.fixture';
import { UserScopeHookFixture } from './user-scope.hook.fixture';

const USER_ENTITY_KEY_FIXTURE = 'user';
const USER_CREDENTIALS_ENTITY_KEY_FIXTURE = 'user-credentials';

@Module({
  imports: [
    TypeOrmModule.forRoot(ormConfig),
    CqrsModule.forRoot(),
    RepositoryModule.forRoot({}),
    CrudModule.forRoot({
      defaultResolver: CrudCqrsResolver,
    }),
    RocketsAppModule.forRoot(),
    PasswordModule.forRoot({}),
    RepositoryModule.forFeature({
      module: TypeOrmRepositoryModule,
      entities: [
        { key: USER_ENTITY_KEY_FIXTURE, entity: UserEntityFixture },
        {
          key: USER_CREDENTIALS_ENTITY_KEY_FIXTURE,
          entity: UserCredentialEntityFixture,
        },
      ],
    }),
    UserModule.forRoot({
      entities: {
        user: USER_ENTITY_KEY_FIXTURE,
        credentials: USER_CREDENTIALS_ENTITY_KEY_FIXTURE,
      },
      ports: {
        password: {
          createCommand: CreatePasswordCommand,
          validateCurrentCommand: ValidateCurrentPasswordCommand,
          validateHistoryCommand: ValidatePasswordHistoryCommand,
        },
      },
    }),
    CrudModule.forFeature<UserInterface>({
      crud: {
        controller: {
          entity: USER_ENTITY_KEY_FIXTURE,
          path: 'user',
          resolver: CrudCqrsResolver,
          transactional: true,
          request: { body: UserCreateDto },
          response: {
            resource: UserDto,
            paginated: UserPaginatedDto,
          },
        },
        operations: [
          {
            operation: Operation.List,
            query: ListUsersRequest,
            queryHandler: ListUsersRequestHandler,
          },
          {
            operation: Operation.Read,
            query: ReadUserRequest,
            queryHandler: ReadUserRequestHandler,
          },
          {
            operation: Operation.Create,
            request: { body: UserCreateDto },
            command: CreateUserRequest,
            commandHandler: CreateUserRequestHandler,
          },
          {
            operation: Operation.Update,
            request: { body: UserUpdateDto },
            command: UpdateUserRequest,
            commandHandler: UpdateUserRequestHandler,
          },
          {
            operation: Operation.Delete,
            command: DeleteUserRequest,
            commandHandler: DeleteUserRequestHandler,
          },
        ],
      },
    }),
    CrudModule.forFeature<PasswordUpdateInterface>({
      crud: {
        controller: {
          entity: USER_ENTITY_KEY_FIXTURE,
          path: 'password',
          resolver: CrudCqrsResolver,
          transactional: true,
          request: { body: UserPasswordUpdateDto },
          response: { resource: UserDto },
          extraDecorators: [UseHooks(UserScopeHookFixture)],
        },
        operations: [
          {
            operation: Operation.Update,
            request: { body: UserPasswordUpdateDto },
            command: UpdateUserPasswordRequest,
            commandHandler: UpdateUserPasswordRequestHandler,
          },
        ],
      },
    }),
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ExceptionsFilter,
    },
    UserScopeHookFixture,
    FakeAuthInterceptorFixture,
    {
      provide: APP_INTERCEPTOR,
      useExisting: FakeAuthInterceptorFixture,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuthorizedUserOverlayFixture,
    },
  ],
})
export class AppModuleCrudFixture {}
