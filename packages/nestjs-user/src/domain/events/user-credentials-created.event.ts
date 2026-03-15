import { IEvent } from '@nestjs/cqrs';

import { EventContextHost } from '@concepta/nestjs-common';

import { UserCredentialsEventPayloadInterface } from './interfaces/user-credentials-event-payload.interface';

export class UserCredentialsCreatedEvent implements IEvent {
  constructor(
    public readonly eventContext: EventContextHost,
    public readonly credentials: UserCredentialsEventPayloadInterface,
  ) {}
}
