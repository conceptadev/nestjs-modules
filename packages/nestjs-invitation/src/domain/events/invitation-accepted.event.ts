import { PlainLiteralObject } from '@nestjs/common';
import { IEvent } from '@nestjs/cqrs';

import { EventContextHost } from '@concepta/nestjs-core';

import { InvitationEventHeaderInterface } from './interfaces/invitation-event-header.interface';
import { InvitationEventPayloadInterface } from './interfaces/invitation-event-payload.interface';

export class InvitationAcceptedEvent implements IEvent {
  constructor(
    public readonly eventContext: EventContextHost<InvitationEventHeaderInterface>,
    public readonly invitation: InvitationEventPayloadInterface,
    public readonly payload?: PlainLiteralObject,
  ) {}
}
