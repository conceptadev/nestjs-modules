import { randomUUID } from 'crypto';

import { AggregateRoot } from '@nestjs/cqrs';

import {
  type DomainFactory,
  DomainMappable,
  EntityHeaderInterface,
  EventContextHost,
  RoleAssignmentEntityInterface,
} from '@concepta/nestjs-common';

import { RoleAssignedEvent } from '../events/role-assigned.event';
import { RoleRevokedEvent } from '../events/role-revoked.event';

export interface RoleAssignmentCreateProps {
  roleId: string;
  assigneeId: string;
}

export class RoleAssignment
  extends AggregateRoot
  implements DomainMappable<RoleAssignmentEntityInterface>
{
  private props: RoleAssignmentEntityInterface;

  constructor(entity: RoleAssignmentEntityInterface) {
    super();
    this.props = { ...entity };
  }

  get id() {
    return this.props.id;
  }

  get roleId() {
    return this.props.roleId;
  }

  get assigneeId() {
    return this.props.assigneeId;
  }

  get dateCreated() {
    return this.props.dateCreated;
  }

  get dateUpdated() {
    return this.props.dateUpdated;
  }

  get dateDeleted() {
    return this.props.dateDeleted;
  }

  get version() {
    return this.props.version;
  }

  static create(
    eventContext: EventContextHost<EntityHeaderInterface>,
    props: RoleAssignmentCreateProps,
  ): RoleAssignment {
    const { roleId, assigneeId } = props;
    const now = new Date();

    const instance = new RoleAssignment({
      id: randomUUID(),
      roleId,
      assigneeId,
      dateCreated: now,
      dateUpdated: now,
      dateDeleted: null,
      version: 1,
    });

    instance.apply(new RoleAssignedEvent(eventContext, instance.toPlain()));

    return instance;
  }

  static toInstance(entity: RoleAssignmentEntityInterface): RoleAssignment {
    return new RoleAssignment(entity);
  }

  toPlain(): RoleAssignmentEntityInterface {
    return { ...this.props };
  }

  hydrate(entity: RoleAssignmentEntityInterface): void {
    this.props = { ...entity };
  }

  revoke(eventContext: EventContextHost<EntityHeaderInterface>): void {
    this.apply(new RoleRevokedEvent(eventContext, this.toPlain()));
  }
}

RoleAssignment satisfies DomainFactory<
  RoleAssignmentEntityInterface,
  RoleAssignmentCreateProps,
  RoleAssignment
>;
