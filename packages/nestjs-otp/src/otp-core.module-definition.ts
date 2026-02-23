import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Provider,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';

import { createSettingsProvider } from '@concepta/nestjs-common';

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
import { OtpOptionsInterface } from './infrastructure/config/interfaces/otp-options.interface';
import { OtpSettingsInterface } from './infrastructure/config/interfaces/otp-settings.interface';
import { otpDefaultConfig } from './infrastructure/config/otp-default.config';
import { OtpRepositoryResolver } from './infrastructure/persistence/otp-repository.resolver';
import { OTP_MODULE_SETTINGS_TOKEN } from './otp.constants';

const RAW_OPTIONS_TOKEN = Symbol('__OTP_MODULE_RAW_OPTIONS_TOKEN__');

export const {
  ConfigurableModuleClass: OtpCoreModuleClass,
  OPTIONS_TYPE: OTP_CORE_OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE: OTP_CORE_ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<OtpOptionsInterface>({
  moduleName: 'OtpCore',
  optionsInjectionToken: RAW_OPTIONS_TOKEN,
})
  .setExtras<Pick<DynamicModule, 'global'>>(
    { global: true },
    definitionTransform,
  )
  .build();

export type OtpCoreOptions = typeof OTP_CORE_OPTIONS_TYPE;
export type OtpCoreAsyncOptions = typeof OTP_CORE_ASYNC_OPTIONS_TYPE;

function definitionTransform(
  definition: DynamicModule,
  extras: Pick<DynamicModule, 'global'>,
): DynamicModule {
  const { imports, providers } = definition;

  return {
    ...definition,
    global: extras.global,
    imports: createOtpImports({ imports }),
    providers: createOtpProviders({ providers }),
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
}): Provider[] {
  return [
    ...(options.providers ?? []),
    createOtpSettingsProvider(options.overrides),
    OtpRepositoryResolver,
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
  ];
}

export function createOtpExports(): Required<
  Pick<DynamicModule, 'exports'>
>['exports'] {
  return [OTP_MODULE_SETTINGS_TOKEN];
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
