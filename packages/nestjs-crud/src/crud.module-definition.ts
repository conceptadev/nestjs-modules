import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Provider,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { createSettingsProvider } from '@concepta/nestjs-common';

import { crudDefaultConfig } from './config/crud-default.config';
import { CrudAdapterResolver } from './crud/resolvers/crud-adapter.resolver';
import { CrudOperationResolver } from './crud/resolvers/crud-operation.resolver';
import { CrudLocalResolverService } from './crud/services/crud-local-resolver.service';
import {
  CRUD_DEFAULT_RESOLVER_TOKEN,
  CRUD_MODULE_SETTINGS_TOKEN,
} from './crud.constants';
import { CrudModuleOptionsExtrasInterface } from './interfaces/crud-module-options-extras.interface';
import { CrudModuleOptionsInterface } from './interfaces/crud-module-options.interface';
import { CrudModuleSettingsInterface } from './interfaces/crud-module-settings.interface';
import { CrudMetaview } from './services/crud-metaview.service';

const RAW_OPTIONS_TOKEN = Symbol('__CRUD_MODULE_RAW_OPTIONS_TOKEN__');

export const {
  ConfigurableModuleClass: CrudModuleClass,
  OPTIONS_TYPE: CRUD_OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE: CRUD_ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<CrudModuleOptionsInterface>({
  moduleName: 'Crud',
  optionsInjectionToken: RAW_OPTIONS_TOKEN,
})
  .setExtras<CrudModuleOptionsExtrasInterface>(
    { global: false },
    definitionTransform,
  )
  .build();

export type CrudOptions = Omit<typeof CRUD_OPTIONS_TYPE, 'global'>;
export type CrudAsyncOptions = Omit<typeof CRUD_ASYNC_OPTIONS_TYPE, 'global'>;

function definitionTransform(
  definition: DynamicModule,
  extras: CrudModuleOptionsExtrasInterface,
): DynamicModule {
  const { providers = [] } = definition;
  const { global = false, imports, defaultResolver } = extras;

  return {
    ...definition,
    global,
    imports: createCrudImports({ imports }),
    providers: createCrudProviders({ providers, defaultResolver }),
    exports: [ConfigModule, RAW_OPTIONS_TOKEN, ...createCrudExports()],
  };
}

export function createCrudImports(
  overrides?: CrudOptions,
): DynamicModule['imports'] {
  const imports = [ConfigModule.forFeature(crudDefaultConfig)];

  if (overrides?.imports?.length) {
    return [...imports, ...overrides.imports];
  } else {
    return imports;
  }
}

export function createCrudExports() {
  return [
    CRUD_MODULE_SETTINGS_TOKEN,
    CrudMetaview,
    CrudAdapterResolver,
    CrudOperationResolver,
    CRUD_DEFAULT_RESOLVER_TOKEN,
    CrudLocalResolverService,
  ];
}

export function createCrudProviders(options: {
  providers?: Provider[];
  defaultResolver?: CrudModuleOptionsExtrasInterface['defaultResolver'];
}): Provider[] {
  const { providers = [], defaultResolver } = options;

  // Determine the default resolver provider
  // If no custom resolver or a built-in resolver, use useExisting to avoid duplicates
  // If external resolver (like CrudCqrsResolver), use useClass to create instance
  const resolverClass = defaultResolver ?? CrudAdapterResolver;
  const isBuiltIn =
    resolverClass === CrudAdapterResolver ||
    resolverClass === CrudOperationResolver;

  const defaultResolverProvider: Provider = isBuiltIn
    ? {
        provide: CRUD_DEFAULT_RESOLVER_TOKEN,
        useExisting: resolverClass,
      }
    : {
        provide: CRUD_DEFAULT_RESOLVER_TOKEN,
        useClass: resolverClass,
      };

  return [
    ...providers,
    CrudMetaview,
    CrudAdapterResolver,
    CrudOperationResolver,
    CrudLocalResolverService,
    defaultResolverProvider,
    createCrudSettingsProvider(),
  ];
}

export function createCrudSettingsProvider(
  optionsOverrides?: CrudOptions,
): Provider {
  return createSettingsProvider<
    CrudModuleSettingsInterface,
    CrudModuleOptionsInterface
  >({
    settingsToken: CRUD_MODULE_SETTINGS_TOKEN,
    optionsToken: RAW_OPTIONS_TOKEN,
    settingsKey: crudDefaultConfig.KEY,
    optionsOverrides,
  });
}
