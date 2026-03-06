import { IEvent } from '@nestjs/cqrs';

import {
  EntityHeaderInterface,
  EventContextHost,
  RoleEntityInterface,
} from '@concepta/nestjs-common';

export class RoleReplacedEvent implements IEvent {
  constructor(
    public readonly eventContext: EventContextHost<EntityHeaderInterface>,
    public readonly role: RoleEntityInterface,
  ) {}
}
