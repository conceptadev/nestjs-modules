import { DomainMapper } from '@concepta/nestjs-core/aggregate';

import { Invitation } from '../../domain/aggregates/invitation';
import { InvitationInterface } from '../../domain/interfaces/invitation.interface';

import { InvitationEntityInterface } from './interfaces/invitation-entity.interface';

export class InvitationMapper extends DomainMapper<
  InvitationEntityInterface,
  InvitationInterface,
  Invitation
> {
  createAggregate(entity: InvitationEntityInterface): Invitation {
    const {
      id,
      version,
      active: _active,
      dateCreated,
      dateUpdated,
      dateDeleted,
      ...props
    } = entity;

    return new Invitation(id, props, version, {
      dateCreated,
      dateUpdated,
      dateDeleted,
    });
  }

  toPersistence(aggregate: Invitation) {
    return {
      ...super.toPersistence(aggregate),
      active: aggregate.active,
    };
  }
}
