import { GuardsPolicySettingsInterface } from '../../../domain/policies/guards.policy';
import { JwtStrategyPolicySettingsInterface } from '../../../domain/policies/jwt-strategy.policy';
import { JwtPolicySettingsInterface } from '../../../domain/policies/jwt.policy';
import { LocalStrategyPolicySettingsInterface } from '../../../domain/policies/local-strategy.policy';
import { RecoveryPolicySettingsInterface } from '../../../domain/policies/recovery.policy';
import { RefreshStrategyPolicySettingsInterface } from '../../../domain/policies/refresh-strategy.policy';
import { VerifyPolicySettingsInterface } from '../../../domain/policies/verify.policy';

export interface AuthenticationStrategiesSettingsInterface {
  jwt?: JwtStrategyPolicySettingsInterface;
  local?: LocalStrategyPolicySettingsInterface;
  refresh?: RefreshStrategyPolicySettingsInterface;
}

export interface AuthenticationMfaSettingsInterface {
  recovery?: RecoveryPolicySettingsInterface;
  verify?: VerifyPolicySettingsInterface;
}

export interface AuthenticationSettingsInterface {
  /**
   * JWT token signing settings (access/refresh secrets, expiry, etc.)
   */
  jwt?: JwtPolicySettingsInterface;

  /**
   * Passport strategy settings (jwt, local, refresh).
   * Presence of a strategy key activates that strategy.
   */
  strategies?: AuthenticationStrategiesSettingsInterface;

  /**
   * Multi-factor authentication settings (recovery, verify).
   * Presence of a key activates that MFA feature.
   */
  mfa?: AuthenticationMfaSettingsInterface;

  /**
   * Guard enablement and disable callback settings.
   */
  guards?: GuardsPolicySettingsInterface;
}
