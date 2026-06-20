import { PasswordValidateOptionsInterface } from './password-validate-options.interface';

/**
 * Password Storage Validation Interface
 */
export interface PasswordValidationServiceInterface {
  /**
   * Validate if password matches and its valid.
   *
   * @param options - Validation options
   */
  validate(options: PasswordValidateOptionsInterface): Promise<boolean>;
}
