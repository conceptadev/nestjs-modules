import { IEvent } from '@nestjs/cqrs';

import { EventContextHost } from '@concepta/nestjs-common';

import { InvitationEventHeaderInterface } from './interfaces/invitation-event-header.interface';

import { InvitationDispatchedMetadataInterface } from './interfaces/invitation-dispatched-metadata.interface';
import { InvitationEventPayloadInterface } from './interfaces/invitation-event-payload.interface';

export class InvitationDispatchedEvent implements IEvent {
  constructor(
    public readonly eventContext: EventContextHost<
      InvitationEventHeaderInterface,
      InvitationDispatchedMetadataInterface
    >,
    public readonly invitation: InvitationEventPayloadInterface,
  ) {}
}
