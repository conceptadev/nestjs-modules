import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Provider,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';

import { IssueAccessTokenHandler } from './application/commands/handlers/issue-access-token.handler';
import { IssueAuthenticatedResponseHandler } from './application/commands/handlers/issue-authenticated-response.handler';
import { IssueRefreshTokenHandler } from './application/commands/handlers/issue-refresh-token.handler';
import { SignAccessTokenHandler } from './application/commands/handlers/sign-access-token.handler';
import { SignRefreshTokenHandler } from './application/commands/handlers/sign-refresh-token.handler';
import { JwtVerifyAccessTokenHandler } from './application/queries/handlers/jwt-verify-access-token.handler';
import { JwtVerifyRefreshTokenHandler } from './application/queries/handlers/jwt-verify-refresh-token.handler';
import { ValidateAndVerifyAccessTokenHandler } from './application/queries/handlers/validate-and-verify-access-token.handler';
import { ValidateAndVerifyRefreshTokenHandler } from './application/queries/handlers/validate-and-verify-refresh-token.handler';
import { ValidateTokenHandler } from './application/queries/handlers/validate-token.handler';
import { VerifyAccessTokenHandler } from './application/queries/handlers/verify-access-token.handler';
import { VerifyRefreshTokenHandler } from './application/queries/handlers/verify-refresh-token.handler';
import { LocalService } from './application/services/local/local.service';
import { RecoveryService } from './application/services/recovery/recovery.service';
import { VerifyService } from './application/services/verify/verify.service';
import { AUTHENTICATION_JWT_PORT_TOKEN } from './authentication.constants';
import { GuardsPolicy } from './domain/policies/guards.policy';
import { JwtPolicy } from './domain/policies/jwt.policy';
import { AuthUserContextOverlay } from './gateways/auth-user-context.overlay';
import { authenticationDefaultConfig } from './infrastructure/config/authentication-default.config';
import { AuthenticationOptionsExtrasInterface } from './infrastructure/config/interfaces/authentication-options-extras.interface';
import { AuthenticationOptionsInterface } from './infrastructure/config/interfaces/authentication-options.interface';
import { NestJwtModule } from './infrastructure/jwt/jwt.externals';
import { JwtService } from './infrastructure/jwt/jwt.service';
import { AuthRouterGuards } from './infrastructure/router/auth-router.constants';
import { JwtGuard } from './infrastructure/strategies/jwt/jwt.guard';
import { JwtStrategy } from './infrastructure/strategies/jwt/jwt.strategy';
import { createAuthRouterGuardsProviders } from './infrastructure/utils/create-auth-router-guards-providers';
import { createGuardsPolicyProvider } from './infrastructure/utils/create-guards-policy-provider';
import { createJwtAppGuardProvider } from './infrastructure/utils/create-jwt-app-guard-provider';
import { createJwtPolicyProvider } from './infrastructure/utils/create-jwt-policy-provider';
import {
  createJwtPortProvider,
  DEFAULT_JWT_PORT_SETTINGS,
} from './infrastructure/utils/create-jwt-port-provider';
import { createJwtStrategyPolicyProvider } from './infrastructure/utils/create-jwt-strategy-policy-provider';
import { createJwtStrategyProvider } from './infrastructure/utils/create-jwt-strategy-provider';
import { createLocalStrategyPolicyProvider } from './infrastructure/utils/create-local-strategy-policy-provider';
import { createLocalStrategyProvider } from './infrastructure/utils/create-local-strategy-provider';
import { createLocalValidateUserServiceProvider } from './infrastructure/utils/create-local-validate-user-service-provider';
import { createOtpPortProvider } from './infrastructure/utils/create-otp-port-provider';
import { createPasswordPortProvider } from './infrastructure/utils/create-password-port-provider';
import { createRecoveryNotificationPortProvider } from './infrastructure/utils/create-recovery-notification-port-provider';
import { createRecoveryPolicyProvider } from './infrastructure/utils/create-recovery-policy-provider';
import { createRecoveryServiceProvider } from './infrastructure/utils/create-recovery-service-provider';
import { createRefreshStrategyPolicyProvider } from './infrastructure/utils/create-refresh-strategy-policy-provider';
import { createRefreshStrategyProvider } from './infrastructure/utils/create-refresh-strategy-provider';
import {
  createTokenPortProvider,
  DEFAULT_TOKEN_PORT_SETTINGS,
} from './infrastructure/utils/create-token-port-provider';
import { createUserPortProvider } from './infrastructure/utils/create-user-port-provider';
import { createVerifyNotificationPortProvider } from './infrastructure/utils/create-verify-notification-port-provider';
import { createVerifyPolicyProvider } from './infrastructure/utils/create-verify-policy-provider';
import { createVerifyServiceProvider } from './infrastructure/utils/create-verify-service-provider';

const RAW_OPTIONS_TOKEN = Symbol('__AUTHENTICATION_MODULE_RAW_OPTIONS_TOKEN__');

export const {
  ConfigurableModuleClass: AuthenticationModuleClass,
  OPTIONS_TYPE: AUTHENTICATION_OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE: AUTHENTICATION_ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<AuthenticationOptionsInterface>({
  moduleName: 'Authentication',
  optionsInjectionToken: RAW_OPTIONS_TOKEN,
})
  .setExtras<AuthenticationOptionsExtrasInterface>(
    { global: false },
    definitionTransform,
  )
  .build();

export type AuthenticationOptions = Omit<
  typeof AUTHENTICATION_OPTIONS_TYPE,
  'global'
>;

export type AuthenticationAsyncOptions = Omit<
  typeof AUTHENTICATION_ASYNC_OPTIONS_TYPE,
  'global'
>;

function definitionTransform(
  definition: DynamicModule,
  extras: AuthenticationOptionsExtrasInterface,
): DynamicModule {
  const { imports = [], providers = [] } = definition;
  const { global = false } = extras;

  return {
    ...definition,
    global,
    imports: createAuthenticationImports({ imports }),
    providers: createAuthenticationProviders({ providers, extras }),
    exports: [
      ConfigModule,
      RAW_OPTIONS_TOKEN,
      ...(createAuthenticationExports(extras) ?? []),
    ],
  };
}

export function createAuthenticationImports(options: {
  imports: DynamicModule['imports'];
}): DynamicModule['imports'] {
  return [
    ...(options.imports || []),
    CqrsModule,
    NestJwtModule.register({}),
    ConfigModule.forFeature(authenticationDefaultConfig),
  ];
}

export function createAuthenticationExports(
  extras?: AuthenticationOptionsExtrasInterface,
): DynamicModule['exports'] {
  const exports: DynamicModule['exports'] = [
    AUTHENTICATION_JWT_PORT_TOKEN,
    JwtService,
    JwtPolicy,
    JwtStrategy,
    JwtGuard,
    GuardsPolicy,
    LocalService,
    RecoveryService,
    VerifyService,
  ];

  if (extras?.guards?.length) {
    exports.push(
      AuthRouterGuards,
      ...extras.guards.map((config) => config.guard),
    );
  }

  return exports;
}

export function createAuthenticationProviders(options: {
  overrides?: AuthenticationOptions;
  providers?: Provider[];
  extras?: AuthenticationOptionsExtrasInterface;
}): Provider[] {
  return [
    ...(options.providers ?? []),
    // Port providers (from options.ports config)
    ...createAuthenticationPortProviders(options.overrides),
    // JWT infrastructure
    JwtService,
    // Policies (always registered with defaults)
    createJwtPolicyProvider(RAW_OPTIONS_TOKEN),
    createJwtStrategyPolicyProvider(RAW_OPTIONS_TOKEN),
    createLocalStrategyPolicyProvider(RAW_OPTIONS_TOKEN),
    createRefreshStrategyPolicyProvider(RAW_OPTIONS_TOKEN),
    createRecoveryPolicyProvider(RAW_OPTIONS_TOKEN),
    createVerifyPolicyProvider(RAW_OPTIONS_TOKEN),
    createGuardsPolicyProvider(RAW_OPTIONS_TOKEN),
    // CQRS handlers — JwtPort default handlers (infrastructure)
    SignAccessTokenHandler,
    SignRefreshTokenHandler,
    JwtVerifyAccessTokenHandler,
    JwtVerifyRefreshTokenHandler,
    // CQRS handlers — TokenPort default handlers (application)
    IssueAccessTokenHandler,
    IssueRefreshTokenHandler,
    VerifyAccessTokenHandler,
    VerifyRefreshTokenHandler,
    IssueAuthenticatedResponseHandler,
    ValidateTokenHandler,
    ValidateAndVerifyAccessTokenHandler,
    ValidateAndVerifyRefreshTokenHandler,
    // Auth-JWT feature
    JwtGuard,
    createJwtStrategyProvider(RAW_OPTIONS_TOKEN),
    createJwtAppGuardProvider(RAW_OPTIONS_TOKEN, options.extras ?? {}),
    // Auth-Local feature
    createLocalValidateUserServiceProvider(RAW_OPTIONS_TOKEN),
    createLocalStrategyProvider(RAW_OPTIONS_TOKEN),
    // Auth-Refresh feature
    createRefreshStrategyProvider(RAW_OPTIONS_TOKEN),
    // Auth-Recovery feature
    createRecoveryServiceProvider(RAW_OPTIONS_TOKEN),
    // Auth-Verify feature
    createVerifyServiceProvider(RAW_OPTIONS_TOKEN),
    // Auth-Router feature
    ...(options.extras?.guards?.length
      ? createAuthRouterGuardsProviders(options.extras.guards)
      : []),
    // Context overlays
    { provide: APP_INTERCEPTOR, useClass: AuthUserContextOverlay },
  ];
}

export function createAuthenticationPortProviders(
  options?: AuthenticationOptions,
): Provider[] {
  const defaultedProviders: Provider[] = [
    createJwtPortProvider({
      ...DEFAULT_JWT_PORT_SETTINGS,
      ...options?.ports?.jwt,
    }),
    createTokenPortProvider({
      ...DEFAULT_TOKEN_PORT_SETTINGS,
      ...options?.ports?.token,
    }),
  ];

  if (!options?.ports) {
    return defaultedProviders;
  }

  const { ports } = options;

  return [
    ...defaultedProviders,
    createUserPortProvider(ports.user),
    createPasswordPortProvider(ports.password),
    createOtpPortProvider(ports.otp),
    createRecoveryNotificationPortProvider(ports.recoveryNotification),
    createVerifyNotificationPortProvider(ports.verifyNotification),
  ];
}
