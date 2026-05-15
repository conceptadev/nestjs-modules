import { IEvent } from '@nestjs/cqrs';

import { EventContextHost } from '@concepta/rockets-app';

import { RoleAssignmentInterface } from '../interfaces/role-assignment.interface';

import { RoleEventHeaderInterface } from './interfaces/role-event-header.interface';

export class RoleAssignedEvent implements IEvent {
  constructor(
    public readonly eventContext: EventContextHost<RoleEventHeaderInterface>,
    public readonly assignment: RoleAssignmentInterface,
  ) {}
}
