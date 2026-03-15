import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Provider,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';

import { createSettingsProvider } from '@concepta/nestjs-common';

import { AssignRoleHandler } from './application/commands/handlers/assign-role.handler';
import { AssignRolesHandler } from './application/commands/handlers/assign-roles.handler';
import { CreateRoleHandler } from './application/commands/handlers/create-role.handler';
import { RemoveRoleHandler } from './application/commands/handlers/remove-role.handler';
import { ReplaceRoleHandler } from './application/commands/handlers/replace-role.handler';
import { RevokeRoleHandler } from './application/commands/handlers/revoke-role.handler';
import { RevokeRolesHandler } from './application/commands/handlers/revoke-roles.handler';
import { UpdateRoleHandler } from './application/commands/handlers/update-role.handler';
import { GetAssignedRolesHandler } from './application/queries/handlers/get-assigned-roles.handler';
import { GetRoleAssignmentHandler } from './application/queries/handlers/get-role-assignment.handler';
import { GetRoleHandler } from './application/queries/handlers/get-role.handler';
import { IsAssignedRoleHandler } from './application/queries/handlers/is-assigned-role.handler';
import { IsAssignedRolesHandler } from './application/queries/handlers/is-assigned-roles.handler';
import { RoleExtrasInterface } from './infrastructure/config/interfaces/role-extras.interface';
import { RoleOptionsInterface } from './infrastructure/config/interfaces/role-options.interface';
import { RoleSettingsInterface } from './infrastructure/config/interfaces/role-settings.interface';
import { roleDefaultConfig } from './infrastructure/config/role-default.config';
import { RoleAssignmentRepositoryResolver } from './infrastructure/persistence/role-assignment-repository.resolver';
import { RoleRepositoryResolver } from './infrastructure/persistence/role-repository.resolver';
import {
  ROLE_ASSIGNMENT_CUSTOM_REPOSITORY_TOKEN,
  ROLE_ASSIGNMENT_REPOSITORY_RESOLVER_TOKEN,
  ROLE_CUSTOM_REPOSITORY_TOKEN,
  ROLE_MODULE_SETTINGS_TOKEN,
  ROLE_REPOSITORY_RESOLVER_TOKEN,
} from './role.constants';

const RAW_OPTIONS_TOKEN = Symbol('__ROLE_MODULE_RAW_OPTIONS_TOKEN__');

export const {
  ConfigurableModuleClass: RoleCoreModuleClass,
  OPTIONS_TYPE: ROLE_CORE_OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE: ROLE_CORE_ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<RoleOptionsInterface>({
  moduleName: 'RoleCore',
  optionsInjectionToken: RAW_OPTIONS_TOKEN,
})
  .setExtras<RoleExtrasInterface>({ global: true }, definitionTransform)
  .build();

export type RoleCoreOptions = typeof ROLE_CORE_OPTIONS_TYPE;
export type RoleCoreAsyncOptions = typeof ROLE_CORE_ASYNC_OPTIONS_TYPE;

function definitionTransform(
  definition: DynamicModule,
  { global, repositories }: RoleExtrasInterface,
): DynamicModule {
  const { providers = [], imports = [] } = definition;

  return {
    ...definition,
    global,
    imports: createRoleImports({ imports }),
    providers: createRoleProviders({ providers, repositories }),
    exports: [ConfigModule, RAW_OPTIONS_TOKEN, ...createRoleExports()],
  };
}

export function createRoleImports(options: {
  imports: DynamicModule['imports'];
}): DynamicModule['imports'] {
  return [
    ...(options.imports || []),
    ConfigModule.forFeature(roleDefaultConfig),
    CqrsModule.forRoot(),
  ];
}

export function createRoleProviders(options: {
  overrides?: RoleCoreOptions;
  providers?: Provider[];
  repositories?: RoleExtrasInterface['repositories'];
}): Provider[] {
  return [
    createRoleSettingsProvider(options.overrides),
    {
      provide: ROLE_CUSTOM_REPOSITORY_TOKEN,
      useValue: options.repositories?.role ?? null,
    },
    {
      provide: ROLE_ASSIGNMENT_CUSTOM_REPOSITORY_TOKEN,
      useValue: options.repositories?.roleAssignment ?? null,
    },
    {
      provide: ROLE_REPOSITORY_RESOLVER_TOKEN,
      useClass: RoleRepositoryResolver,
    },
    {
      provide: ROLE_ASSIGNMENT_REPOSITORY_RESOLVER_TOKEN,
      useClass: RoleAssignmentRepositoryResolver,
    },
    // Command handlers
    CreateRoleHandler,
    UpdateRoleHandler,
    ReplaceRoleHandler,
    RemoveRoleHandler,
    AssignRoleHandler,
    AssignRolesHandler,
    RevokeRoleHandler,
    RevokeRolesHandler,
    // Query handlers
    GetRoleHandler,
    GetRoleAssignmentHandler,
    GetAssignedRolesHandler,
    IsAssignedRoleHandler,
    IsAssignedRolesHandler,
    ...(options.providers ?? []),
  ];
}

export function createRoleExports(): Required<
  Pick<DynamicModule, 'exports'>
>['exports'] {
  return [ROLE_MODULE_SETTINGS_TOKEN];
}

export function createRoleSettingsProvider(
  optionsOverrides?: RoleCoreOptions,
): Provider {
  return createSettingsProvider<RoleSettingsInterface, RoleOptionsInterface>({
    settingsToken: ROLE_MODULE_SETTINGS_TOKEN,
    optionsToken: RAW_OPTIONS_TOKEN,
    settingsKey: roleDefaultConfig.KEY,
    optionsOverrides,
  });
}
