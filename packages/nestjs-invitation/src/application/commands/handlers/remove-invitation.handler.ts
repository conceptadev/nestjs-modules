import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Invitation } from '../../../domain/aggregates/invitation';
import { InvitationService } from '../../../domain/services/invitation.service';
import { RemoveInvitationCommand } from '../impl/remove-invitation.command';

@CommandHandler(RemoveInvitationCommand)
export class RemoveInvitationHandler implements ICommandHandler<RemoveInvitationCommand> {
  constructor(private readonly invitationService: InvitationService) {}

  async execute(command: RemoveInvitationCommand): Promise<Invitation> {
    const { ctx, id } = command;
    return this.invitationService.remove(ctx, id);
  }
}
