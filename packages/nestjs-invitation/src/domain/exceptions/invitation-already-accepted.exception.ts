import { InvitationException } from './invitation.exception.js';

export class InvitationAlreadyAcceptedException extends InvitationException {
  constructor() {
    super({
      message: 'Invitation has already been accepted',
    });

    this.errorCode = 'INVITATION_ALREADY_ACCEPTED_ERROR';
  }
}
