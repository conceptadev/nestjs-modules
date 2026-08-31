import { HttpStatus } from '@nestjs/common';

import { type RuntimeExceptionOptions } from '@concepta/nestjs-core';

import { InvitationException } from '../../domain/exceptions/invitation.exception.js';

/**
 * Thrown when an invitation acceptance fails.
 */
export class InvitationNotAcceptedException extends InvitationException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      httpStatus: HttpStatus.BAD_REQUEST,
      fault: 'internal',
      ...options,
    });
    this.errorCode = 'INVITATION_NOT_ACCEPTED_ERROR';
  }
}
