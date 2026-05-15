// gateways (context overlays)
export {
  AuthUserCtx,
  AuthUserContextOverlay,
} from './gateways/auth-user-context.overlay';
export { AuthUserContextInterface } from './gateways/interfaces/auth-user-context.interface';

// domain aggregates
export { Token } from './domain/aggregates/token.aggregate';

// domain interfaces
export { AuthenticatedUserInterface } from './domain/interfaces/authenticated-user.interface';
export { AuthenticationAccessInterface } from './domain/interfaces/authentication-access.interface';
export { AuthenticationLoginInterface } from './domain/interfaces/authentication-login.interface';
export { AuthenticationRefreshInterface } from './domain/interfaces/authentication-refresh.interface';
export { AuthenticatedResponseInterface } from './domain/interfaces/authenticated-response.interface';
export { AuthorizationPayloadInterface } from './domain/interfaces/authorization-payload.interface';
export { TokenInterface, TokenType } from './domain/interfaces/token.interface';
export { TokenCreatableInterface } from './domain/interfaces/token-creatable.interface';

// domain events
export { TokenIssuedEvent } from './domain/events/token-issued.event';
export { TokenRevokedEvent } from './domain/events/token-revoked.event';

export { AuthenticationModule } from './authentication.module';

export { PassportStrategyFactory } from './infrastructure/passport/passport-strategy.factory';
export { AuthGuard } from './infrastructure/auth.guard';

export { AuthUser } from './infrastructure/decorators/auth-user.decorator';
export {
  AuthPublic,
  AuthPublicMetadata,
  AuthPublicOptions,
} from './infrastructure/decorators/auth-public.decorator';

export { AuthenticationOptionsInterface } from './infrastructure/config/interfaces/authentication-options.interface';
export { AuthenticationOptionsExtrasInterface } from './infrastructure/config/interfaces/authentication-options-extras.interface';
export {
  AuthenticationSettingsInterface,
  AuthenticationStrategiesSettingsInterface,
  AuthenticationMfaSettingsInterface,
} from './infrastructure/config/interfaces/authentication-settings.interface';
export { OAuthAuthenticateOptionsInterface } from './infrastructure/config/interfaces/oauth-authenticate-options.interface';
export { OAuthParamsInterface } from './infrastructure/config/interfaces/oauth-params.interface';
export { OAuthRequestInterface } from './infrastructure/config/interfaces/oauth-request.interface';

export { AuthenticationResponseDto } from './infrastructure/dtos/authenticated-response.dto';

export {
  AuthGuardOptions,
  AuthGuardCtr,
} from './infrastructure/auth.guard.types';
export { AuthenticationEmailException } from './domain/exceptions/authentication-email.exception';
export { TokenException } from './domain/exceptions/token.exception';
export { TokenAlreadyRevokedException } from './domain/exceptions/token-already-revoked.exception';
export { AuthenticationException } from './domain/exceptions/authentication.exception';
export { AuthenticationAccessTokenException } from './application/exceptions/authentication-access-token.exception';
export { AuthenticationRefreshTokenException } from './application/exceptions/authentication-refresh-token.exception';
export { AuthenticationUserPortRequiredException } from './application/exceptions/authentication-user-port-required.exception';
export { AuthenticationFeatureConfigException } from './infrastructure/exceptions/authentication-feature-config.exception';

export { processOAuthParams } from './infrastructure/utils/oauth-auth-params.util';

// jwt (tokens layer)
export { JwtService } from './infrastructure/jwt/jwt.service';
export {
  JwtPort,
  JwtPortSettings,
  SignTokenCommandInterface,
  JwtVerifyTokenQueryInterface,
} from './domain/ports/jwt.port';
export { AUTHENTICATION_JWT_PORT_TOKEN } from './authentication.constants';
export { ExtractJwt, JwtFromRequestFunction } from 'passport-jwt';
export { JwtException } from './infrastructure/jwt/exceptions/jwt.exception';
export { JwtVerifyException } from './infrastructure/jwt/exceptions/jwt-verify.exception';

// passport adapter layer
export { JwtVerifyTokenCallback } from './infrastructure/passport/jwt-passport.types';
export { JwtPassportOptionsInterface } from './infrastructure/passport/interfaces/jwt-passport-options.interface';
export { JwtPassportStrategy } from './infrastructure/passport/jwt-passport.strategy';
export { createVerifyTokenCallback } from './infrastructure/passport/utils/create-verify-token-callback.util';

// auth-jwt feature
export { JwtStrategy } from './infrastructure/strategies/jwt/jwt.strategy';
export { JwtGuard } from './infrastructure/strategies/jwt/jwt.guard';
export { JwtAuthenticationException } from './infrastructure/strategies/jwt/exceptions/jwt-authentication.exception';
export { JwtUnauthorizedException } from './infrastructure/strategies/jwt/exceptions/jwt-unauthorized.exception';

// auth-local feature
export { LocalService } from './application/services/local/local.service';
export { LocalGuard } from './infrastructure/strategies/local/local.guard';
export { LocalValidateUserInterface } from './application/services/local/interfaces/local-validate-user.interface';
export { LocalServiceInterface } from './application/services/local/interfaces/local-service.interface';
export { LocalCredentialsInterface } from './infrastructure/strategies/local/interfaces/local-credentials.interface';
export { LocalLoginDto } from './infrastructure/strategies/local/dto/local-login.dto';
export { LocalException } from './infrastructure/strategies/local/exceptions/local.exception';
export { LocalUsernameNotFoundException } from './application/exceptions/local-username-not-found.exception';
export { LocalUserInactiveException } from './application/exceptions/local-user-inactive.exception';
export { LocalUnauthorizedException } from './infrastructure/strategies/local/exceptions/local-unauthorized.exception';
export { LocalInvalidPasswordException } from './application/exceptions/local-invalid-password.exception';
export { LocalInvalidLoginDataException } from './infrastructure/strategies/local/exceptions/local-invalid-login-data.exception';
export { LocalInvalidCredentialsException } from './infrastructure/strategies/local/exceptions/local-invalid-credentials.exception';

// auth-refresh feature
export { RefreshDto } from './infrastructure/strategies/refresh/dto/refresh.dto';
export { RefreshGuard } from './infrastructure/strategies/refresh/refresh.guard';
export { RefreshException } from './infrastructure/strategies/refresh/exceptions/refresh.exception';
export { RefreshUnauthorizedException } from './infrastructure/strategies/refresh/exceptions/refresh-unauthorized.exception';

// auth-recovery feature
export { RecoveryService } from './application/services/recovery/recovery.service';
export { RecoveryRecoverLoginDto } from './infrastructure/mfa/recovery/dto/recovery-recover-login.dto';
export { RecoveryRecoverPasswordDto } from './infrastructure/mfa/recovery/dto/recovery-recover-password.dto';
export { RecoveryUpdatePasswordDto } from './infrastructure/mfa/recovery/dto/recovery-update-password.dto';
export { RecoveryValidatePasscodeDto } from './infrastructure/mfa/recovery/dto/recovery-validate-passcode.dto';
export { RecoveryException } from './infrastructure/mfa/recovery/exceptions/recovery.exception';
export { RecoveryOtpInvalidException } from './infrastructure/mfa/recovery/exceptions/recovery-otp-invalid.exception';

// auth-verify feature
export { VerifyService } from './application/services/verify/verify.service';
export { VerifyDto } from './infrastructure/mfa/verify/dto/verify.dto';
export { VerifyUpdateDto } from './infrastructure/mfa/verify/dto/verify-update.dto';
export { VerifyConfirmParamsInterface } from './application/services/verify/interfaces/verify-confirm-params.interface';
export { VerifySendParamsInterface } from './application/services/verify/interfaces/verify-send-params.interface';
export { VerifyException } from './infrastructure/mfa/verify/exceptions/verify.exception';
export { VerifyOtpInvalidException } from './application/exceptions/verify-otp-invalid.exception';

// auth-router feature
export { AuthRouterGuard } from './infrastructure/router/auth-router.guard';
export { AuthRouterGuardsRecord } from './infrastructure/router/auth-router.types';
export { AuthRouterException } from './infrastructure/router/exceptions/auth-router.exception';
export { AuthRouterGuardConfigInterface } from './infrastructure/router/interfaces/auth-router-guard-config.interface';

// domain policies
export {
  OtpPolicy,
  OtpPolicySettingsInterface,
} from './domain/policies/otp.policy';
export {
  JwtPolicy,
  JwtPolicySettingsInterface,
} from './domain/policies/jwt.policy';
export {
  JwtStrategyPolicy,
  JwtStrategyPolicySettingsInterface,
} from './domain/policies/jwt-strategy.policy';
export {
  LocalStrategyPolicy,
  LocalStrategyPolicySettingsInterface,
} from './domain/policies/local-strategy.policy';
export {
  RefreshStrategyPolicy,
  RefreshStrategyPolicySettingsInterface,
} from './domain/policies/refresh-strategy.policy';
export {
  GuardsPolicy,
  GuardsPolicySettingsInterface,
} from './domain/policies/guards.policy';
export {
  RecoveryPolicy,
  RecoveryPolicySettingsInterface,
} from './domain/policies/recovery.policy';
export {
  VerifyPolicy,
  VerifyPolicySettingsInterface,
} from './domain/policies/verify.policy';

// domain ports
export {
  TokenPort,
  TokenPortSettings,
  IssueTokenCommandInterface,
  VerifyTokenQueryInterface,
  ValidateTokenQueryInterface,
} from './domain/ports/token.port';
export {
  UserPort,
  UserPortSettings,
  AuthenticationUserInterface,
  AuthenticationUserResult,
  GetUserByIdQueryInterface,
  GetUserBySubjectQueryInterface,
  GetUserByUsernameQueryInterface,
  GetUserByEmailQueryInterface,
} from './domain/ports/user.port';
export {
  PasswordPort,
  PasswordPortSettings,
  ValidatePasswordCommandInterface,
  SetPasswordCommandInterface,
} from './domain/ports/password.port';
export {
  OtpPort,
  OtpPortSettings,
  AuthenticationOtpCreatableInterface,
  AuthenticationOtpInterface,
  CreateOtpCommandInterface,
  ValidateOtpQueryInterface,
  ClearOtpCommandInterface,
} from './domain/ports/otp.port';
export {
  RecoveryNotificationPort,
  RecoveryNotificationPortSettings,
  SendRecoverLoginNotificationCommandInterface,
  SendRecoverPasswordNotificationCommandInterface,
  SendPasswordUpdatedNotificationCommandInterface,
} from './domain/ports/recovery-notification.port';
export {
  VerifyNotificationPort,
  VerifyNotificationPortSettings,
  SendVerifyNotificationCommandInterface,
} from './domain/ports/verify-notification.port';

// ports options
export { AuthenticationPortsInterface } from './infrastructure/config/interfaces/authentication-options.interface';

// default CQRS commands/queries (for TokenPort)
export { IssueAccessTokenCommand } from './application/commands/impl/issue-access-token.command';
export { IssueRefreshTokenCommand } from './application/commands/impl/issue-refresh-token.command';
export { IssueAuthenticatedResponseCommand } from './application/commands/impl/issue-authenticated-response.command';
export { VerifyAccessTokenQuery } from './application/queries/impl/verify-access-token.query';
export { VerifyRefreshTokenQuery } from './application/queries/impl/verify-refresh-token.query';
export { ValidateTokenQuery } from './application/queries/impl/validate-token.query';
export {
  ValidateAndVerifyAccessTokenQuery,
  ValidateAndVerifyAccessTokenQueryInterface,
} from './application/queries/impl/validate-and-verify-access-token.query';
export {
  ValidateAndVerifyRefreshTokenQuery,
  ValidateAndVerifyRefreshTokenQueryInterface,
} from './application/queries/impl/validate-and-verify-refresh-token.query';

// default CQRS commands/queries (for JwtPort)
export { SignAccessTokenCommand } from './application/commands/impl/sign-access-token.command';
export { SignRefreshTokenCommand } from './application/commands/impl/sign-refresh-token.command';
export { JwtVerifyAccessTokenQuery } from './application/queries/impl/jwt-verify-access-token.query';
export { JwtVerifyRefreshTokenQuery } from './application/queries/impl/jwt-verify-refresh-token.query';
