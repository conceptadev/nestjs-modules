import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Invitation } from '../../../domain/aggregates/invitation';
import { InvitationService } from '../../../domain/services/invitation.service';
import { CreateInvitationCommand } from '../impl/create-invitation.command';

@CommandHandler(CreateInvitationCommand)
export class CreateInvitationHandler
  implements ICommandHandler<CreateInvitationCommand>
{
  constructor(private readonly invitationService: InvitationService) {}

  async execute(command: CreateInvitationCommand): Promise<Invitation> {
    const { ctx, dto } = command;
    return this.invitationService.create(ctx, dto);
  }
}
