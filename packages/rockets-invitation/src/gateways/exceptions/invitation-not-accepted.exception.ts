import { HttpStatus } from '@nestjs/common';

import { RuntimeExceptionOptions } from '@concepta/rockets-app';

import { InvitationException } from '../../domain/exceptions/invitation.exception';

/**
 * Thrown when an invitation acceptance fails.
 */
export class InvitationNotAcceptedException extends InvitationException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      httpStatus: HttpStatus.BAD_REQUEST,
      ...options,
    });
    this.errorCode = 'INVITATION_NOT_ACCEPTED_ERROR';
  }
}
