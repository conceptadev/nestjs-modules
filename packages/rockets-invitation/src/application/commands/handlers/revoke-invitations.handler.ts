import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { InvitationService } from '../../../domain/services/invitation.service';
import { RevokeInvitationsCommand } from '../impl/revoke-invitations.command';

@CommandHandler(RevokeInvitationsCommand)
export class RevokeInvitationsHandler
  implements ICommandHandler<RevokeInvitationsCommand>
{
  constructor(private readonly invitationService: InvitationService) {}

  async execute(command: RevokeInvitationsCommand): Promise<void> {
    const { ctx, email, category } = command;
    return this.invitationService.revokeByEmail(ctx, email, category);
  }
}
