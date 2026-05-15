import { IEvent } from '@nestjs/cqrs';

import { EventContextHost } from '@concepta/rockets-app';

import { InvitationEventHeaderInterface } from './interfaces/invitation-event-header.interface';
import { InvitationEventPayloadInterface } from './interfaces/invitation-event-payload.interface';

export class InvitationRevokedEvent implements IEvent {
  constructor(
    public readonly eventContext: EventContextHost<InvitationEventHeaderInterface>,
    public readonly invitation: InvitationEventPayloadInterface,
  ) {}
}
