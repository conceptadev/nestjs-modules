import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { SendInvitationCommand } from '../../../../application/commands/impl/send-invitation.command';
import { assertInvitationId } from '../../../../application/utils/assert-invitation-id.util';
import { SendInvitationRequest } from '../impl/send-invitation.request';

@CommandHandler(SendInvitationRequest)
export class SendInvitationRequestHandler implements ICommandHandler<SendInvitationRequest> {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(command: SendInvitationRequest): Promise<void> {
    const { context } = command;
    const { id } = context.params;

    assertInvitationId(id);

    await this.commandBus.execute(new SendInvitationCommand(context, id));
  }
}
