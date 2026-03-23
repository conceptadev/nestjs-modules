import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { AppContextHost } from '@concepta/nestjs-common';
import { RepositoryContextInterface } from '@concepta/nestjs-repository';

import { InvitationDispatchedEvent } from '../../domain/events/invitation-dispatched.event';
import { InvitationEmailPort } from '../../domain/ports/invitation-email.port';

@EventsHandler(InvitationDispatchedEvent)
export class InvitationDispatchedListener
  implements IEventHandler<InvitationDispatchedEvent>
{
  constructor(private readonly emailPort: InvitationEmailPort) {}

  async handle(event: InvitationDispatchedEvent): Promise<void> {
    const { invitation, eventContext } = event;
    const passcode = eventContext.getMeta('passcode');
    const tokenExp = eventContext.getMeta('tokenExp');

    const ctx = AppContextHost.merge<RepositoryContextInterface>(() => ({
      entity: '',
    }));

    await this.emailPort.sendInvitation(ctx, invitation, {
      passcode,
      tokenExp,
    });
  }
}
