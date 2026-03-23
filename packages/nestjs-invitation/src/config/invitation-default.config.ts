import { registerAs } from '@nestjs/config';

import { DeepPartial } from '@concepta/nestjs-common';

import { InvitationSettingsInterface } from '../interfaces/options/invitation-settings.interface';
import { INVITATION_MODULE_DEFAULT_SETTINGS_TOKEN } from '../invitation.constants';

/**
 * Default configuration for invitation.
 *
 * External port command/query types must be provided by the consumer
 * through module options. These defaults only cover scalar settings.
 */
export const invitationDefaultConfig = registerAs(
  INVITATION_MODULE_DEFAULT_SETTINGS_TOKEN,
  (): DeepPartial<InvitationSettingsInterface> => ({
    email: {
      from: 'no-reply@dispostable.com',
      baseUrl: 'http://localhost:3000',
      templates: {
        invitation: {
          logo: 'public/logo.svg',
          fileName:
            __dirname + '/../assets/templates/email/invitation.template.hbs',
          subject: 'Access Invitation',
        },
        invitationAccepted: {
          logo: 'public/logo.svg',
          fileName:
            __dirname +
            '/../assets/templates/email/invitation-accepted.template.hbs',
          subject: 'Invitation Accepted',
        },
      },
    },
    otp: {
      namespace: 'user-otp',
      type: 'uuid',
      expiresIn: '7d',
      clearOtpOnCreate: process.env.INVITATION_OTP_CLEAR_ON_CREATE
        ? process.env.INVITATION_OTP_CLEAR_ON_CREATE === 'true'
        : false,
    },
  }),
);
