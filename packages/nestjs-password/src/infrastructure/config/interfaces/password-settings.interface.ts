import { type PasswordStrengthEnum } from '../../../domain/enum/password-strength.enum';

/**
 * Password module settings interface
 */
export interface PasswordSettingsInterface {
  /**
   * Min level of password strength allowed
   */
  minPasswordStrength?: PasswordStrengthEnum;

  /**
   * Require current password to update
   */
  requireCurrentToUpdate?: boolean;
}
