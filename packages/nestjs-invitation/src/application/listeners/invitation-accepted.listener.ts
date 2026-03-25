import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { InvitationAcceptedEvent } from '../../domain/events/invitation-accepted.event';
import { InvitationEmailPort } from '../../domain/ports/invitation-email.port';

@EventsHandler(InvitationAcceptedEvent)
export class InvitationAcceptedListener
  implements IEventHandler<InvitationAcceptedEvent>
{
  constructor(private readonly emailPort: InvitationEmailPort) {}

  async handle(event: InvitationAcceptedEvent): Promise<void> {
    await this.emailPort.sendAccepted({}, event.invitation);
  }
}
