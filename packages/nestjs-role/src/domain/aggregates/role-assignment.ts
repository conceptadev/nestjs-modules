import { randomUUID } from 'crypto';

import {
  type DomainFactory,
  EntityHeaderInterface,
  EventContextHost,
  RoleAssignmentInterface,
} from '@concepta/nestjs-common';

import { DomainAggregate } from '../../../../nestjs-common/dist/index-aggregate';
import { RoleAssignedEvent } from '../events/role-assigned.event';
import { RoleRevokedEvent } from '../events/role-revoked.event';

export interface RoleAssignmentCreateProps {
  roleId: string;
  assigneeId: string;
}

export class RoleAssignment extends DomainAggregate<RoleAssignmentInterface> {
  get roleId() {
    return this.props.roleId;
  }

  get assigneeId() {
    return this.props.assigneeId;
  }

  static create(
    eventContext: EventContextHost<EntityHeaderInterface>,
    props: RoleAssignmentCreateProps,
  ): RoleAssignment {
    return RoleAssignment.createWithId(eventContext, randomUUID(), props);
  }

  static createWithId(
    eventContext: EventContextHost<EntityHeaderInterface>,
    id: string,
    props: RoleAssignmentCreateProps,
  ): RoleAssignment {
    const { roleId, assigneeId } = props;

    const instance = new RoleAssignment(id, {
      roleId,
      assigneeId,
    });

    instance.apply(new RoleAssignedEvent(eventContext, instance.toPlain()));

    return instance;
  }

  revoke(eventContext: EventContextHost<EntityHeaderInterface>): void {
    this.apply(new RoleRevokedEvent(eventContext, this.toPlain()));
  }
}

RoleAssignment satisfies DomainFactory<
  RoleAssignmentCreateProps,
  RoleAssignment
>;
