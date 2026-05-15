import { JwtPortSettings } from '../../../domain/ports/jwt.port';
import { OtpPortSettings } from '../../../domain/ports/otp.port';
import { PasswordPortSettings } from '../../../domain/ports/password.port';
import { RecoveryNotificationPortSettings } from '../../../domain/ports/recovery-notification.port';
import { TokenPortSettings } from '../../../domain/ports/token.port';
import { UserPortSettings } from '../../../domain/ports/user.port';
import { VerifyNotificationPortSettings } from '../../../domain/ports/verify-notification.port';

import { AuthenticationSettingsInterface } from './authentication-settings.interface';

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
