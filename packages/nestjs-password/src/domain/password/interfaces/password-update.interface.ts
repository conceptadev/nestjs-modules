import { type PasswordPlainCurrentInterface } from './password-plain-current.interface';
import { type PasswordPlainInterface } from './password-plain.interface';

/**
 * Password update interface combining new password with optional current password.
 */
export interface PasswordUpdateInterface
  extends PasswordPlainInterface, Partial<PasswordPlainCurrentInterface> {}
