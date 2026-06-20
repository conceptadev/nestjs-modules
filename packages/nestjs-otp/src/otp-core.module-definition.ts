import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Provider,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';

import { createSettingsProvider } from '@concepta/nestjs-core';

import { ClearOtpHistoryHandler } from './application/commands/handlers/clear-otp-history.handler';
import { ClearOtpsHandler } from './application/commands/handlers/clear-otps.handler';
import { ConsumeOtpHandler } from './application/commands/handlers/consume-otp.handler';
import { CreateOtpHandler } from './application/commands/handlers/create-otp.handler';
import { DeactivateOtpHandler } from './application/commands/handlers/deactivate-otp.handler';
import { RemoveOtpHandler } from './application/commands/handlers/remove-otp.handler';
import { OtpHistoryCleanupListener } from './application/listeners/otp-history-cleanup.listener';
import { FindActiveOtpHandler } from './application/queries/handlers/find-active-otp.handler';
import { FindAssignedOtpsHandler } from './application/queries/handlers/find-assigned-otps.handler';
import { GetOtpHandler } from './application/queries/handlers/get-otp.handler';
import { ValidateOtpHandler } from './application/queries/handlers/validate-otp.handler';
import { OtpHistoryCleanupService } from './domain/services/otp-history-cleanup.service';
import { OtpContextOverlay } from './gateways/otp-context.overlay';
import { OtpExtrasInterface } from './infrastructure/config/interfaces/otp-extras.interface';
import { OtpOptionsInterface } from './infrastructure/config/interfaces/otp-options.interface';
import { OtpSettingsInterface } from './infrastructure/config/interfaces/otp-settings.interface';
import { otpDefaultConfig } from './infrastructure/config/otp-default.config';
import { OtpRepositoryResolver } from './infrastructure/persistence/otp-repository.resolver';
import { OtpMapper } from './infrastructure/persistence/otp.mapper';
import {
  OTP_CUSTOM_REPOSITORY_TOKEN,
  OTP_MODULE_SETTINGS_TOKEN,
  OTP_REPOSITORY_RESOLVER_TOKEN,
} from './otp.constants';

const RAW_OPTIONS_TOKEN = Symbol('__OTP_MODULE_RAW_OPTIONS_TOKEN__');

export const {
  ConfigurableModuleClass: OtpCoreModuleClass,
  OPTIONS_TYPE: OTP_CORE_OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE: OTP_CORE_ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<OtpOptionsInterface>({
  moduleName: 'OtpCore',
  optionsInjectionToken: RAW_OPTIONS_TOKEN,
})
  .setExtras<OtpExtrasInterface>({ global: true }, definitionTransform)
  .build();

export type OtpCoreOptions = typeof OTP_CORE_OPTIONS_TYPE;
export type OtpCoreAsyncOptions = typeof OTP_CORE_ASYNC_OPTIONS_TYPE;

function definitionTransform(
  definition: DynamicModule,
  { global, providers: overrideProviders, repositories }: OtpExtrasInterface,
): DynamicModule {
  const { providers = [], imports = [] } = definition;

  return {
    ...definition,
    global,
    imports: createOtpImports({ imports }),
    providers: createOtpProviders({
      providers: [...providers, ...(overrideProviders ?? [])],
      repositories,
    }),
    exports: [ConfigModule, RAW_OPTIONS_TOKEN, ...createOtpExports()],
  };
}

export function createOtpImports(options: {
  imports: DynamicModule['imports'];
}): DynamicModule['imports'] {
  return [
    ...(options.imports || []),
    ConfigModule.forFeature(otpDefaultConfig),
    CqrsModule.forRoot(),
  ];
}

export function createOtpProviders(options: {
  overrides?: OtpCoreOptions;
  providers?: Provider[];
  repositories?: OtpExtrasInterface['repositories'];
}): Provider[] {
  return [
    createOtpSettingsProvider(options.overrides),
    OtpMapper,
    {
      provide: OTP_CUSTOM_REPOSITORY_TOKEN,
      useValue: options.repositories?.otp ?? null,
    },
    {
      provide: OTP_REPOSITORY_RESOLVER_TOKEN,
      useClass: OtpRepositoryResolver,
    },
    // Command handlers
    ConsumeOtpHandler,
    CreateOtpHandler,
    RemoveOtpHandler,
    ClearOtpsHandler,
    ClearOtpHistoryHandler,
    DeactivateOtpHandler,
    // Event listeners
    OtpHistoryCleanupListener,
    // Domain services
    OtpHistoryCleanupService,
    // Query handlers
    FindActiveOtpHandler,
    FindAssignedOtpsHandler,
    GetOtpHandler,
    ValidateOtpHandler,
    // Context overlays
    { provide: APP_INTERCEPTOR, useClass: OtpContextOverlay },
    ...(options.providers ?? []),
  ];
}

export function createOtpExports(): Required<
  Pick<DynamicModule, 'exports'>
>['exports'] {
  return [OTP_MODULE_SETTINGS_TOKEN, OtpMapper];
}

export function createOtpSettingsProvider(
  optionsOverrides?: OtpCoreOptions,
): Provider {
  return createSettingsProvider<OtpSettingsInterface, OtpOptionsInterface>({
    settingsToken: OTP_MODULE_SETTINGS_TOKEN,
    optionsToken: RAW_OPTIONS_TOKEN,
    settingsKey: otpDefaultConfig.KEY,
    optionsOverrides,
  });
}
