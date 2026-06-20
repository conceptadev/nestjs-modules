import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Invitation } from '../../../domain/aggregates/invitation';
import { InvitationService } from '../../../domain/services/invitation.service';
import { AcceptInvitationCommand } from '../impl/accept-invitation.command';

@CommandHandler(AcceptInvitationCommand)
export class AcceptInvitationHandler implements ICommandHandler<AcceptInvitationCommand> {
  constructor(private readonly invitationService: InvitationService) {}

  async execute(command: AcceptInvitationCommand): Promise<Invitation | null> {
    const { ctx, code, dto } = command;
    return this.invitationService.accept(ctx, code, dto.passcode, dto.payload);
  }
}
