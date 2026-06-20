import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { RemoveInvitationCommand } from '../../../../application/commands/impl/remove-invitation.command';
import { assertInvitationId } from '../../../../application/utils/assert-invitation-id.util';
import { DeleteInvitationRequest } from '../impl/delete-invitation.request';

@Injectable()
export class DeleteInvitationRequestHandler {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(command: DeleteInvitationRequest) {
    const { context } = command;
    const { id } = context.params;
    const { returnDeleted = false } = context.options?.route ?? {};

    assertInvitationId(id);

    // Invitations are always hard-deleted (no archive/soft-delete)
    const invitation = await this.commandBus.execute(
      new RemoveInvitationCommand(context, id),
    );

    return returnDeleted ? invitation.toPlain() : null;
  }
}
