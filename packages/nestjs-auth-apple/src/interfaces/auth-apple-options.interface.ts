import { IssueTokenServiceInterface } from '@concepta/nestjs-authentication';
import { ModuleOptionsSettingsInterface } from '@concepta/nestjs-common';
import { JwtVerifyServiceInterface } from '@concepta/nestjs-jwt';

import { AuthAppleServiceInterface } from './auth-apple-service.interface';
import { AuthAppleSettingsInterface } from './auth-apple-settings.interface';

export interface AuthAppleOptionsInterface extends ModuleOptionsSettingsInterface<AuthAppleSettingsInterface> {
  /**
   * Implementation of a class used to verify Apple tokens
   */
  jwtService?: JwtVerifyServiceInterface;

  /**
   * Implementation of a class to issue tokens
   */
  issueTokenService?: IssueTokenServiceInterface;

  /**
   * Implementation of a class to handle apple authentication
   */
  authAppleService?: AuthAppleServiceInterface;

  /**
   * Settings
   */
  settings?: AuthAppleSettingsInterface;
}
