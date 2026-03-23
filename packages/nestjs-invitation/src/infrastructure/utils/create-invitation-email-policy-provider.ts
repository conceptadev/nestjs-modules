import { Provider } from '@nestjs/common';

import { InvitationEmailPolicy } from '../../domain/policies/invitation-email.policy';
import { InvitationSettingsInterface } from '../../interfaces/options/invitation-settings.interface';
import { INVITATION_MODULE_SETTINGS_TOKEN } from '../../invitation.constants';

export function createInvitationEmailPolicyProvider(): Provider {
  return {
    provide: InvitationEmailPolicy,
    inject: [INVITATION_MODULE_SETTINGS_TOKEN],
    useFactory: (settings: InvitationSettingsInterface) =>
      new InvitationEmailPolicy(settings.email),
  };
}
