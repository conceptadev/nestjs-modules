import { IEvent } from '@nestjs/cqrs';

import {
  EntityHeaderInterface,
  EventContextHost,
  RoleAssignmentInterface,
} from '@concepta/nestjs-common';

export class RoleAssignedEvent implements IEvent {
  constructor(
    public readonly eventContext: EventContextHost<EntityHeaderInterface>,
    public readonly assignment: RoleAssignmentInterface,
  ) {}
}
