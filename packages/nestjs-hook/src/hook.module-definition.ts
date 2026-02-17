import {
  ConfigurableModuleBuilder,
  DynamicModule,
  ModuleMetadata,
  Provider,
} from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { HookResolverService } from './hook-resolver.service';
import { HookInterceptor } from './hook.interceptor';
import { HookModuleOptionsInterface } from './hook.interfaces';

const RAW_OPTIONS_TOKEN = Symbol('__HOOK_MODULE_RAW_OPTIONS_TOKEN__');

export const {
  ConfigurableModuleClass: HookModuleClass,
  OPTIONS_TYPE: HOOK_OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE: HOOK_ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<HookModuleOptionsInterface>({
  moduleName: 'Hook',
  optionsInjectionToken: RAW_OPTIONS_TOKEN,
})
  .setClassMethodName('forRoot')
  .setExtras<{ global?: boolean }>({ global: true }, definitionTransform)
  .build();

export type HookOptions = Omit<typeof HOOK_OPTIONS_TYPE, 'global'>;
export type HookAsyncOptions = Omit<typeof HOOK_ASYNC_OPTIONS_TYPE, 'global'>;

function definitionTransform(
  definition: DynamicModule,
  extras: { global?: boolean },
): DynamicModule {
  const { providers = [] } = definition;
  const { global = true } = extras;

  return {
    ...definition,
    global,
    providers: createHookProviders({ providers }),
    exports: [RAW_OPTIONS_TOKEN, ...createHookExports()],
  };
}

export function createHookExports(): Required<
  Pick<ModuleMetadata, 'exports'>
>['exports'] {
  return [HookResolverService, HookInterceptor];
}

export function createHookProviders(options: {
  providers?: Provider[];
}): Provider[] {
  return [
    ...(options.providers ?? []),
    HookResolverService,
    HookInterceptor,
    {
      provide: APP_INTERCEPTOR,
      useClass: HookInterceptor,
    },
  ];
}
