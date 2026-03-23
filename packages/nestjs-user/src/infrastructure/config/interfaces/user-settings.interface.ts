import { PasswordPolicySettings } from '../../../domain/policies/user-password.policy';

export interface UserSettingsInterface {
  password?: PasswordPolicySettings;
}
