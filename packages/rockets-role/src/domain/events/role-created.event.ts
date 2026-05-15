import { IEvent } from '@nestjs/cqrs';

import { EventContextHost } from '@concepta/rockets-app';

import { RoleInterface } from '../interfaces/role.interface';

import { RoleEventHeaderInterface } from './interfaces/role-event-header.interface';

export class RoleCreatedEvent implements IEvent {
  constructor(
    public readonly eventContext: EventContextHost<RoleEventHeaderInterface>,
    public readonly role: RoleInterface,
  ) {}
}
