import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { InvitationAcceptedEvent } from '../../domain/events/invitation-accepted.event';
import { InvitationNotificationPort } from '../../domain/ports/invitation-notification.port';

@EventsHandler(InvitationAcceptedEvent)
export class InvitationAcceptedListener
  implements IEventHandler<InvitationAcceptedEvent>
{
  constructor(private readonly notificationPort: InvitationNotificationPort) {}

  async handle(event: InvitationAcceptedEvent): Promise<void> {
    await this.notificationPort.sendAccepted({}, event.invitation);
  }
}
