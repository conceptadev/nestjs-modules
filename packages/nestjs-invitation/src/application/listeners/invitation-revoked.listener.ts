import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { InvitationRevokedEvent } from '../../domain/events/invitation-revoked.event';
import { InvitationOtpPort } from '../../domain/ports/invitation-otp.port';

@EventsHandler(InvitationRevokedEvent)
export class InvitationRevokedListener implements IEventHandler<InvitationRevokedEvent> {
  constructor(private readonly otpPort: InvitationOtpPort) {}

  async handle(event: InvitationRevokedEvent): Promise<void> {
    const { category, userId } = event.invitation;
    await this.otpPort.clear({}, category, userId);
  }
}
