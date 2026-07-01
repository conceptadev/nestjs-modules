import { type ModuleOptionsControllerInterface } from '@concepta/nestjs-core';

import { type InvitationNotificationPortSettings } from '../../domain/ports/invitation-notification.port';
import { type InvitationOtpPortSettings } from '../../domain/ports/invitation-otp.port';
import { type InvitationUserPortSettings } from '../../domain/ports/invitation-user.port';

import { type InvitationSettingsInterface } from './invitation-settings.interface';

export interface InvitationPortsInterface {
  otp: InvitationOtpPortSettings;
  user: InvitationUserPortSettings;
  notification: InvitationNotificationPortSettings;
}

export interface InvitationOptionsInterface extends ModuleOptionsControllerInterface {
  settings?: InvitationSettingsInterface;
  ports: InvitationPortsInterface;
}
