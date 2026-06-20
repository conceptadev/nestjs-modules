import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { AcceptInvitationCommand } from '../../../../application/commands/impl/accept-invitation.command';
import { assertInvitationCode } from '../../../../application/utils/assert-invitation-code.util';
import { Invitation } from '../../../../domain/aggregates/invitation';
import { InvitationNotAcceptedException } from '../../../exceptions/invitation-not-accepted.exception';
import { AcceptInvitationRequest } from '../impl/accept-invitation.request';

@CommandHandler(AcceptInvitationRequest)
export class AcceptInvitationRequestHandler implements ICommandHandler<AcceptInvitationRequest> {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(command: AcceptInvitationRequest): Promise<null> {
    const { context, dto } = command;
    const { code } = context.params;

    assertInvitationCode(code);

    let invitation: Invitation | null = null;

    try {
      invitation = await this.commandBus.execute(
        new AcceptInvitationCommand(context, code, dto),
      );
    } catch (e: unknown) {
      throw new InvitationNotAcceptedException({
        originalError: e,
      });
    }

    if (!invitation) {
      throw new InvitationNotAcceptedException();
    }

    return null;
  }
}
