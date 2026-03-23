import { PlainLiteralObject } from '@nestjs/common';
import { IEvent } from '@nestjs/cqrs';

import {
  EntityHeaderInterface,
  EventContextHost,
} from '@concepta/nestjs-common';

import { InvitationEventPayloadInterface } from './interfaces/invitation-event-payload.interface';

export class InvitationAcceptedEvent implements IEvent {
  constructor(
    public readonly eventContext: EventContextHost<EntityHeaderInterface>,
    public readonly invitation: InvitationEventPayloadInterface,
    public readonly payload?: PlainLiteralObject,
  ) {}
}
