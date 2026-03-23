import { InvitationOtpSettingsInterface } from '../../domain/interfaces/invitation-otp-settings.interface';
import { InvitationEmailSettings } from '../../domain/policies/invitation-email.policy';

export interface InvitationSettingsInterface {
  email: InvitationEmailSettings;
  otp: InvitationOtpSettingsInterface;
}
