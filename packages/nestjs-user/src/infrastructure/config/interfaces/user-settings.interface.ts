import { InvitationAcceptedEventPayloadInterface } from '@concepta/nestjs-common';
import {
  EventAsyncInterface,
  EventClassInterface,
} from '@concepta/nestjs-event';

import { PasswordPolicySettings } from '../../../domain/policies/user-password.policy';

export interface UserSettingsInterface {
  invitationAcceptedEvent?: EventClassInterface<
    EventAsyncInterface<InvitationAcceptedEventPayloadInterface, boolean>
  >;
  password?: PasswordPolicySettings;
}
