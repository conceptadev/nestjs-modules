import { ModuleOptionsControllerInterface } from '@concepta/nestjs-common';

import { InvitationEmailPortSettings } from '../../domain/ports/invitation-email.port';
import { InvitationOtpPortSettings } from '../../domain/ports/invitation-otp.port';
import { InvitationUserPortSettings } from '../../domain/ports/invitation-user.port';

import { InvitationSettingsInterface } from './invitation-settings.interface';

export interface InvitationPortsInterface {
  otp: InvitationOtpPortSettings;
  user: InvitationUserPortSettings;
  email: InvitationEmailPortSettings;
}

export interface InvitationOptionsInterface
  extends ModuleOptionsControllerInterface {
  settings?: InvitationSettingsInterface;
  ports: InvitationPortsInterface;
}
