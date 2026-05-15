import { HttpStatus } from '@nestjs/common';

import { RuntimeException } from '@concepta/rockets-app';

import { InvitationException } from '../../domain/exceptions/invitation.exception';

export class InvitationNotFoundException extends InvitationException {
  context: RuntimeException['context'] & {
    id: string;
  };

  constructor(id: string, message = 'Invitation not found for id=%s') {
    super({
      httpStatus: HttpStatus.NOT_FOUND,
      message,
      messageParams: [id],
    });

    this.errorCode = 'INVITATION_NOT_FOUND_ERROR';

    this.context = {
      ...super.context,
      id,
    };
  }
}
