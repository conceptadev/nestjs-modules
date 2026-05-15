import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Invitation } from '../../../domain/aggregates/invitation';
import { InvitationService } from '../../../domain/services/invitation.service';
import { CreateInvitationByEmailCommand } from '../impl/create-invitation-by-email.command';

@CommandHandler(CreateInvitationByEmailCommand)
export class CreateInvitationByEmailHandler
  implements ICommandHandler<CreateInvitationByEmailCommand>
{
  constructor(private readonly invitationService: InvitationService) {}

  async execute(command: CreateInvitationByEmailCommand): Promise<Invitation> {
    const { ctx, dto } = command;
    return this.invitationService.createByEmail(ctx, dto);
  }
}
