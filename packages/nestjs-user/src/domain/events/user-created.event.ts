import { IEvent } from '@nestjs/cqrs';

import { EventContextHost, UserInterface } from '@concepta/nestjs-common';

export class UserCreatedEvent implements IEvent {
  constructor(
    public readonly eventContext: EventContextHost,
    public readonly user: UserInterface,
  ) {}
}
