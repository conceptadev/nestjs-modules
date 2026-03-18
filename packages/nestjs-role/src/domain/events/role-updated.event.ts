import { IEvent } from '@nestjs/cqrs';

import {
  EntityHeaderInterface,
  EventContextHost,
  RoleInterface,
} from '@concepta/nestjs-common';

export class RoleUpdatedEvent implements IEvent {
  constructor(
    public readonly eventContext: EventContextHost<EntityHeaderInterface>,
    public readonly role: RoleInterface,
  ) {}
}
