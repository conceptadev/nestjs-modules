import { IEvent } from '@nestjs/cqrs';

import {
  EntityHeaderInterface,
  EventContextHost,
  RoleAssignmentEntityInterface,
} from '@concepta/nestjs-common';

export class RoleRevokedEvent implements IEvent {
  constructor(
    public readonly eventContext: EventContextHost<EntityHeaderInterface>,
    public readonly assignment: RoleAssignmentEntityInterface,
  ) {}
}
