import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-common';

import { InvitationException } from '../../domain/exceptions/invitation.exception';

/**
 * Thrown when an error occurs while attempting to deliver email.
 */
export class InvitationSendMailException extends InvitationException {
  context: RuntimeException['context'] & {
    emailAddress: string;
  };

  constructor(emailAddress: string, options?: RuntimeExceptionOptions) {
    super({
      message: 'Error while trying to send invitation email to %s',
      messageParams: [emailAddress],
      ...options,
    });
    this.errorCode = 'INVITATION_SEND_MAIL_ERROR';
    this.context = {
      ...super.context,
      emailAddress,
    };
  }
}
