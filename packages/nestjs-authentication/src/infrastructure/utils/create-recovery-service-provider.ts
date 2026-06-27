import { type Provider } from '@nestjs/common';

import { RecoveryService } from '../../application/services/recovery/recovery.service';
import {
  AUTHENTICATION_OTP_PORT_TOKEN,
  AUTHENTICATION_USER_PORT_TOKEN,
  AUTHENTICATION_PASSWORD_PORT_TOKEN,
  AUTHENTICATION_RECOVERY_NOTIFICATION_PORT_TOKEN,
} from '../../authentication.constants';
import { RecoveryPolicy } from '../../domain/policies/recovery.policy';
import { type OtpPort } from '../../domain/ports/otp.port';
import { type PasswordPort } from '../../domain/ports/password.port';
import { type RecoveryNotificationPort } from '../../domain/ports/recovery-notification.port';
import { type UserPort } from '../../domain/ports/user.port';
import { type AuthenticationOptionsInterface } from '../config/interfaces/authentication-options.interface';
import { AuthenticationFeatureConfigException } from '../exceptions/authentication-feature-config.exception';

export function createRecoveryServiceProvider(
  rawOptionsToken: symbol,
): Provider {
  return {
    provide: RecoveryService,
    inject: [
      rawOptionsToken,
      RecoveryPolicy,
      { token: AUTHENTICATION_OTP_PORT_TOKEN, optional: true },
      { token: AUTHENTICATION_USER_PORT_TOKEN, optional: true },
      { token: AUTHENTICATION_PASSWORD_PORT_TOKEN, optional: true },
      {
        token: AUTHENTICATION_RECOVERY_NOTIFICATION_PORT_TOKEN,
        optional: true,
      },
    ],
    useFactory: (
      options: AuthenticationOptionsInterface,
      recoveryPolicy: RecoveryPolicy,
      otpPort: OtpPort | null,
      userPort: UserPort | null,
      passwordPort: PasswordPort | null,
      recoveryNotificationPort: RecoveryNotificationPort | null,
    ) => {
      if (!options.settings?.mfa?.recovery) return null;
      if (!otpPort || !userPort || !passwordPort || !recoveryNotificationPort) {
        const missing = [
          !otpPort && 'OtpPort',
          !userPort && 'UserPort',
          !passwordPort && 'PasswordPort',
          !recoveryNotificationPort && 'RecoveryNotificationPort',
        ].filter((m): m is string => Boolean(m));
        throw new AuthenticationFeatureConfigException('mfa.recovery', missing);
      }
      return new RecoveryService(
        recoveryPolicy,
        otpPort,
        userPort,
        passwordPort,
        recoveryNotificationPort,
      );
    },
  };
}
