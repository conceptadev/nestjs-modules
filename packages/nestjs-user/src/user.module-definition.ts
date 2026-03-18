import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Provider,
  Type,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';

import { createSettingsProvider } from '@concepta/nestjs-common';

import { CreateUserCredentialHandler } from './application/commands/handlers/create-user-credential.handler';
import { CreateUserHandler } from './application/commands/handlers/create-user.handler';
import { RemoveUserHandler } from './application/commands/handlers/remove-user.handler';
import { SetUserPasswordHandler } from './application/commands/handlers/set-user-password.handler';
import { UpdateUserCredentialHandler } from './application/commands/handlers/update-user-credential.handler';
import { UpdateUserPasswordHandler } from './application/commands/handlers/update-user-password.handler';
import { UpdateUserHandler } from './application/commands/handlers/update-user.handler';
import { InvitationAcceptedListener } from './application/listeners/invitation-accepted.listener';
import { GetUserByEmailHandler } from './application/queries/handlers/get-user-by-email.handler';
import { GetUserBySubjectHandler } from './application/queries/handlers/get-user-by-subject.handler';
import { GetUserByUsernameHandler } from './application/queries/handlers/get-user-by-username.handler';
import { GetUserHandler } from './application/queries/handlers/get-user.handler';
import { UserCredentialsRepositoryInterface } from './domain/repositories/user-credentials-repository.interface';
import { UserCredentialsService } from './domain/services/user-credentials.service';
import { UserExtrasInterface } from './infrastructure/config/interfaces/user-extras.interface';
import { UserOptionsInterface } from './infrastructure/config/interfaces/user-options.interface';
import { UserSettingsInterface } from './infrastructure/config/interfaces/user-settings.interface';
import { userDefaultConfig } from './infrastructure/config/user-default.config';
import { UserCredentialsMapper } from './infrastructure/persistence/user-credentials.mapper';
import { UserMapper } from './infrastructure/persistence/user.mapper';
import { createPasswordPolicyProvider } from './infrastructure/utils/create-password-policy-provider';
import { createUserCredentialsRepositoryProvider } from './infrastructure/utils/create-user-credentials-repository-provider';
import { createUserRepositoryProvider } from './infrastructure/utils/create-user-repository-provider';
import { USER_MODULE_SETTINGS_TOKEN } from './user.constants';

const RAW_OPTIONS_TOKEN = Symbol('__USER_MODULE_RAW_OPTIONS_TOKEN__');

export const {
  ConfigurableModuleClass: UserModuleClass,
  OPTIONS_TYPE: USER_OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE: USER_ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<UserOptionsInterface>({
  moduleName: 'User',
  optionsInjectionToken: RAW_OPTIONS_TOKEN,
})
  .setExtras<UserExtrasInterface>(
    { global: false, entities: { user: 'user' } },
    definitionTransform,
  )
  .build();

export type UserOptions = typeof USER_OPTIONS_TYPE;
export type UserAsyncOptions = typeof USER_ASYNC_OPTIONS_TYPE;

function definitionTransform(
  definition: DynamicModule,
  {
    global,
    providers: overrideProviders,
    entities,
    repositories,
  }: UserExtrasInterface,
): DynamicModule {
  const { providers = [], imports = [] } = definition;

  return {
    ...definition,
    global,
    imports: createUserImports({ imports }),
    providers: createUserProviders({
      providers: [...providers, ...(overrideProviders ?? [])],
      entities,
      repositories,
    }),
    exports: [ConfigModule, RAW_OPTIONS_TOKEN, ...createUserExports()],
  };
}

export function createUserImports(options: {
  imports: DynamicModule['imports'];
}): DynamicModule['imports'] {
  return [
    ...(options.imports || []),
    ConfigModule.forFeature(userDefaultConfig),
    CqrsModule.forRoot(),
  ];
}

export function createUserProviders(options: {
  overrides?: UserOptions;
  providers?: Provider[];
  entities: UserExtrasInterface['entities'];
  repositories?: UserExtrasInterface['repositories'];
}): Provider[] {
  return [
    createUserSettingsProvider(options.overrides),
    UserMapper,
    // User repository
    ...createUserRepositoryProvider(
      options.entities.user,
      options.repositories?.user,
    ),
    // User CRUD command handlers
    CreateUserHandler,
    UpdateUserHandler,
    RemoveUserHandler,
    // Password command handlers (dispatch to credential commands via CommandBus)
    SetUserPasswordHandler,
    UpdateUserPasswordHandler,
    // User CRUD query handlers
    GetUserHandler,
    GetUserByEmailHandler,
    GetUserByUsernameHandler,
    GetUserBySubjectHandler,
    // Listener
    InvitationAcceptedListener,
    // Credentials infrastructure (only when credentials entity is configured)
    ...createUserCredentialProviders(
      options.entities.credentials,
      options.repositories?.userCredentials,
    ),
    // Consumer overrides (last provider for a token wins)
    ...(options.providers ?? []),
  ];
}

function createUserCredentialProviders(
  entityKey?: string,
  customRepository?: Type<UserCredentialsRepositoryInterface>,
): Provider[] {
  if (!entityKey && !customRepository) {
    return [];
  }

  return [
    createPasswordPolicyProvider(),
    UserCredentialsMapper,
    ...createUserCredentialsRepositoryProvider(entityKey, customRepository),
    CreateUserCredentialHandler,
    UpdateUserCredentialHandler,
    UserCredentialsService,
  ];
}

export function createUserExports(): Required<
  Pick<DynamicModule, 'exports'>
>['exports'] {
  return [USER_MODULE_SETTINGS_TOKEN];
}

export function createUserSettingsProvider(
  optionsOverrides?: UserOptions,
): Provider {
  return createSettingsProvider<UserSettingsInterface, UserOptionsInterface>({
    settingsToken: USER_MODULE_SETTINGS_TOKEN,
    optionsToken: RAW_OPTIONS_TOKEN,
    settingsKey: userDefaultConfig.KEY,
    optionsOverrides,
  });
}
