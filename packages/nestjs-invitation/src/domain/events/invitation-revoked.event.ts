import { type IEvent } from '@nestjs/cqrs';

import { type EventContextHost } from '@concepta/nestjs-core';

import { type InvitationEventHeaderInterface } from './interfaces/invitation-event-header.interface';
import { type InvitationEventPayloadInterface } from './interfaces/invitation-event-payload.interface';

export class InvitationRevokedEvent implements IEvent {
  constructor(
    public readonly eventContext: EventContextHost<InvitationEventHeaderInterface>,
    public readonly invitation: InvitationEventPayloadInterface,
  ) {}
}
