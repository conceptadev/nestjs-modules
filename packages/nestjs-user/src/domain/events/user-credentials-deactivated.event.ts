import { IEvent } from '@nestjs/cqrs';

import { EventContextHost } from '@concepta/nestjs-core';

import { UserCredentialsEventPayloadInterface } from './interfaces/user-credentials-event-payload.interface';

export class UserCredentialsDeactivatedEvent implements IEvent {
  constructor(
    public readonly eventContext: EventContextHost,
    public readonly credentials: UserCredentialsEventPayloadInterface,
  ) {}
}
