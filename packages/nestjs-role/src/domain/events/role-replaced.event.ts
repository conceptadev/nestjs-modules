import { type IEvent } from '@nestjs/cqrs';

import { type EventContextHost } from '@concepta/nestjs-core';

import { type RoleInterface } from '../interfaces/role.interface';

import { type RoleEventHeaderInterface } from './interfaces/role-event-header.interface';

export class RoleReplacedEvent implements IEvent {
  constructor(
    public readonly eventContext: EventContextHost<RoleEventHeaderInterface>,
    public readonly role: RoleInterface,
  ) {}
}
