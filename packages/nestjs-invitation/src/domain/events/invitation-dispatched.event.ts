import { IEvent } from '@nestjs/cqrs';

import {
  EntityHeaderInterface,
  EventContextHost,
} from '@concepta/nestjs-common';

import { InvitationDispatchedMetadataInterface } from './interfaces/invitation-dispatched-metadata.interface';
import { InvitationEventPayloadInterface } from './interfaces/invitation-event-payload.interface';

export class InvitationDispatchedEvent implements IEvent {
  constructor(
    public readonly eventContext: EventContextHost<
      EntityHeaderInterface,
      InvitationDispatchedMetadataInterface
    >,
    public readonly invitation: InvitationEventPayloadInterface,
  ) {}
}
