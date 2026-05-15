import { Provider } from '@nestjs/common';

import { InvitationOtpPolicy } from '../../domain/policies/invitation-otp.policy';
import { InvitationSettingsInterface } from '../../interfaces/options/invitation-settings.interface';
import { INVITATION_MODULE_SETTINGS_TOKEN } from '../../invitation.constants';

export function createInvitationOtpPolicyProvider(): Provider {
  return {
    provide: InvitationOtpPolicy,
    inject: [INVITATION_MODULE_SETTINGS_TOKEN],
    useFactory: (settings: InvitationSettingsInterface) =>
      new InvitationOtpPolicy(settings.otp),
  };
}
