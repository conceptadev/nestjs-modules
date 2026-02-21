import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Provider,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';

import { createSettingsProvider } from '@concepta/nestjs-common';

import { ArchiveCacheHandler } from './application/commands/handlers/archive-cache.handler';
import { ClearCachesByAssigneeHandler } from './application/commands/handlers/clear-caches-by-assignee.handler';
import { CreateCacheHandler } from './application/commands/handlers/create-cache.handler';
import { RemoveCacheHandler } from './application/commands/handlers/remove-cache.handler';
import { ReplaceCacheHandler } from './application/commands/handlers/replace-cache.handler';
import { UpdateCacheHandler } from './application/commands/handlers/update-cache.handler';
import { UpsertCacheHandler } from './application/commands/handlers/upsert-cache.handler';
import { FindCachesByAssigneeHandler } from './application/queries/handlers/find-caches-by-assignee.handler';
import { FindOneCacheHandler } from './application/queries/handlers/find-one-cache.handler';
import { GetCacheHandler } from './application/queries/handlers/get-cache.handler';
import { CACHE_MODULE_SETTINGS_TOKEN } from './cache.constants';
import { cacheDefaultConfig } from './infrastructure/config/cache-default.config';
import { CacheOptionsInterface } from './infrastructure/config/interfaces/cache-options.interface';
import { CacheSettingsInterface } from './infrastructure/config/interfaces/cache-settings.interface';
import { CacheRepositoryResolver } from './infrastructure/persistence/cache-repository.resolver';

const RAW_OPTIONS_TOKEN = Symbol('__CACHE_MODULE_RAW_OPTIONS_TOKEN__');

export const {
  ConfigurableModuleClass: CacheCoreModuleClass,
  OPTIONS_TYPE: CACHE_CORE_OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE: CACHE_CORE_ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<CacheOptionsInterface>({
  moduleName: 'CacheCore',
  optionsInjectionToken: RAW_OPTIONS_TOKEN,
})
  .setExtras<Pick<DynamicModule, 'global'>>(
    { global: true },
    definitionTransform,
  )
  .build();

export type CacheCoreOptions = typeof CACHE_CORE_OPTIONS_TYPE;
export type CacheCoreAsyncOptions = typeof CACHE_CORE_ASYNC_OPTIONS_TYPE;

function definitionTransform(
  definition: DynamicModule,
  extras: Pick<DynamicModule, 'global'>,
): DynamicModule {
  const { imports, providers } = definition;

  return {
    ...definition,
    global: extras.global,
    imports: createCacheImports({ imports }),
    providers: createCacheProviders({ providers }),
    exports: [ConfigModule, RAW_OPTIONS_TOKEN, ...createCacheExports()],
  };
}

export function createCacheImports(options: {
  imports: DynamicModule['imports'];
}): DynamicModule['imports'] {
  return [
    ...(options.imports || []),
    ConfigModule.forFeature(cacheDefaultConfig),
    CqrsModule.forRoot(),
  ];
}

export function createCacheProviders(options: {
  overrides?: CacheCoreOptions;
  providers?: Provider[];
}): Provider[] {
  return [
    ...(options.providers ?? []),
    createCacheSettingsProvider(options.overrides),
    CacheRepositoryResolver,
    UpsertCacheHandler,
    ClearCachesByAssigneeHandler,
    CreateCacheHandler,
    UpdateCacheHandler,
    RemoveCacheHandler,
    ReplaceCacheHandler,
    ArchiveCacheHandler,
    GetCacheHandler,
    FindOneCacheHandler,
    FindCachesByAssigneeHandler,
  ];
}

export function createCacheExports(): Required<
  Pick<DynamicModule, 'exports'>
>['exports'] {
  return [CACHE_MODULE_SETTINGS_TOKEN];
}

export function createCacheSettingsProvider(
  optionsOverrides?: CacheCoreOptions,
): Provider {
  return createSettingsProvider<CacheSettingsInterface, CacheOptionsInterface>({
    settingsToken: CACHE_MODULE_SETTINGS_TOKEN,
    optionsToken: RAW_OPTIONS_TOKEN,
    settingsKey: cacheDefaultConfig.KEY,
    optionsOverrides,
  });
}
