import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { AppContextHost } from '@concepta/nestjs-common';
import { RepositoryContextInterface } from '@concepta/nestjs-repository';

import { InvitationAcceptedEvent } from '../../domain/events/invitation-accepted.event';
import { InvitationEmailPort } from '../../domain/ports/invitation-email.port';

@EventsHandler(InvitationAcceptedEvent)
export class InvitationAcceptedListener
  implements IEventHandler<InvitationAcceptedEvent>
{
  constructor(private readonly emailPort: InvitationEmailPort) {}

  async handle(event: InvitationAcceptedEvent): Promise<void> {
    const ctx = AppContextHost.merge<RepositoryContextInterface>(() => ({
      entity: '',
    }));
    await this.emailPort.sendAccepted(ctx, event.invitation);
  }
}
