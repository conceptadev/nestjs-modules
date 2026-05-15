import { ModuleOptionsControllerInterface } from '@concepta/rockets-app';

import { InvitationNotificationPortSettings } from '../../domain/ports/invitation-notification.port';
import { InvitationOtpPortSettings } from '../../domain/ports/invitation-otp.port';
import { InvitationUserPortSettings } from '../../domain/ports/invitation-user.port';

import { InvitationSettingsInterface } from './invitation-settings.interface';

export interface InvitationPortsInterface {
  otp: InvitationOtpPortSettings;
  user: InvitationUserPortSettings;
  notification: InvitationNotificationPortSettings;
}

export interface InvitationOptionsInterface
  extends ModuleOptionsControllerInterface {
  settings?: InvitationSettingsInterface;
  ports: InvitationPortsInterface;
}
