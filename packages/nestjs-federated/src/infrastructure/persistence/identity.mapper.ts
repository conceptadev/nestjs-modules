import { DomainMapper } from '@concepta/nestjs-core/aggregate';

import { Identity } from '../../domain/aggregates/identity';
import { type IdentityInterface } from '../../domain/interfaces/identity.interface';

import { type IdentityEntityInterface } from './interfaces/identity-entity.interface';

export class IdentityMapper extends DomainMapper<
  IdentityEntityInterface,
  IdentityInterface,
  Identity
> {
  createAggregate(entity: IdentityEntityInterface): Identity {
    const { id, version, dateCreated, dateUpdated, dateDeleted, ...props } =
      entity;

    return new Identity(id, props, version, {
      dateCreated,
      dateUpdated,
      dateDeleted,
    });
  }
}
