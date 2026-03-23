import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-common';

/**
 * Generic invitation exception.
 */
export class InvitationException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super(options);
    this.errorCode = 'INVITATION_ERROR';
  }
}
