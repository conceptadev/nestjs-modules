import { IEvent } from '@nestjs/cqrs';

import {
  EventContextHost,
  RoleAssignmentInterface,
} from '@concepta/nestjs-common';

import { RoleEventHeaderInterface } from './interfaces/role-event-header.interface';

export class RoleRevokedEvent implements IEvent {
  constructor(
    public readonly eventContext: EventContextHost<RoleEventHeaderInterface>,
    public readonly assignment: RoleAssignmentInterface,
  ) {}
}
