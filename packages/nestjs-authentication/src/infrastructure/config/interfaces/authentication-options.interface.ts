import { type JwtPortSettings } from '../../../domain/ports/jwt.port';
import { type OtpPortSettings } from '../../../domain/ports/otp.port';
import { type PasswordPortSettings } from '../../../domain/ports/password.port';
import { type RecoveryNotificationPortSettings } from '../../../domain/ports/recovery-notification.port';
import { type TokenPortSettings } from '../../../domain/ports/token.port';
import { type UserPortSettings } from '../../../domain/ports/user.port';
import { type VerifyNotificationPortSettings } from '../../../domain/ports/verify-notification.port';

import { type AuthenticationSettingsInterface } from './authentication-settings.interface';

export interface AuthenticationPortsInterface {
  jwt?: JwtPortSettings;
  token?: TokenPortSettings;
  user: UserPortSettings;
  password: PasswordPortSettings;
  otp: OtpPortSettings;
  recoveryNotification: RecoveryNotificationPortSettings;
  verifyNotification: VerifyNotificationPortSettings;
}

/**
 * Authentication module configuration options interface
 */
export interface AuthenticationOptionsInterface {
  settings?: AuthenticationSettingsInterface;
  ports?: AuthenticationPortsInterface;
}
