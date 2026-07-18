import { InvitationException } from './invitation.exception.js';

export class InvitationRevokedException extends InvitationException {
  constructor() {
    super({
      message: 'Invitation has been revoked',
    });

    this.errorCode = 'INVITATION_REVOKED_ERROR';
  }
}
