import { IEvent } from '@nestjs/cqrs';

import { EventContextHost } from '@concepta/nestjs-core';

import { UserInterface } from '../interfaces/user.interface';

export class UserUpdatedEvent implements IEvent {
  constructor(
    public readonly eventContext: EventContextHost,
    public readonly user: UserInterface,
  ) {}
}
