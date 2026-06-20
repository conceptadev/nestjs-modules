import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Provider,
} from '@nestjs/common';

import {
  createHookFeatureExports,
  createHookFeatureProviders,
} from './infrastructure/hook/utils/create-hook-feature-providers';

const ROCKETS_APP_MODULE_RAW_OPTIONS_TOKEN = Symbol(
  '__ROCKETS_APP_MODULE_RAW_OPTIONS_TOKEN__',
);

export interface RocketsAppOptionsInterface {
  // Reserved for future feature options
}

export interface RocketsAppOptionsExtrasInterface {
  global?: boolean;
}

export const {
  ConfigurableModuleClass: RocketsAppModuleClass,
  OPTIONS_TYPE: ROCKETS_APP_OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE: ROCKETS_APP_ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<RocketsAppOptionsInterface>({
  moduleName: 'RocketsApp',
  optionsInjectionToken: ROCKETS_APP_MODULE_RAW_OPTIONS_TOKEN,
})
  .setExtras<RocketsAppOptionsExtrasInterface>(
    { global: true },
    definitionTransform,
  )
  .build();

export type RocketsAppOptions = Omit<typeof ROCKETS_APP_OPTIONS_TYPE, 'global'>;
export type RocketsAppAsyncOptions = Omit<
  typeof ROCKETS_APP_ASYNC_OPTIONS_TYPE,
  'global'
>;

function definitionTransform(
  definition: DynamicModule,
  extras: RocketsAppOptionsExtrasInterface,
): DynamicModule {
  const { providers = [] } = definition;
  const { global = true } = extras;

  return {
    ...definition,
    global,
    providers: createRocketsAppProviders({ providers }),
    exports: [
      ROCKETS_APP_MODULE_RAW_OPTIONS_TOKEN,
      ...createRocketsAppExports(),
    ],
  };
}

export function createRocketsAppProviders(options: {
  providers?: Provider[];
}): Provider[] {
  return [
    ...(options.providers ?? []),
    // Hook feature
    ...createHookFeatureProviders(),
  ];
}

export function createRocketsAppExports(): NonNullable<
  DynamicModule['exports']
> {
  return [
    // Hook feature
    ...createHookFeatureExports(),
  ];
}
