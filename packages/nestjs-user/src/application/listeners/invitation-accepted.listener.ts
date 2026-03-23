import { CommandBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { AppContextHost } from '@concepta/nestjs-common';
import { InvitationAcceptedEvent } from '@concepta/nestjs-invitation';
import { RepositoryContextInterface } from '@concepta/nestjs-repository';

import { UserException } from '../../domain/exceptions/user.exception';
import { UpdateUserCommand } from '../commands/impl/update-user.command';

@EventsHandler(InvitationAcceptedEvent)
export class InvitationAcceptedListener
  implements IEventHandler<InvitationAcceptedEvent>
{
  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: InvitationAcceptedEvent) {
    const { invitation } = event;

    if (invitation.category !== 'user') {
      return;
    }

    const { userId } = invitation;

    if (typeof userId !== 'string') {
      throw new UserException({
        message:
          'The invitation accepted event payload received has invalid content. The payload must have the "invitation.userId" property.',
      });
    }

    const ctx = AppContextHost.merge<RepositoryContextInterface>(() => ({}));

    await this.commandBus.execute(
      new UpdateUserCommand(ctx, userId, { active: true }),
    );
  }
}
