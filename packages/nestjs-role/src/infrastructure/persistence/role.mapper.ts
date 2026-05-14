import { DomainMapper } from '@concepta/rockets-app/aggregate';

import { Role } from '../../domain/aggregates/role';
import { RoleEntityInterface } from '../../domain/interfaces/role-entity.interface';
import { RoleInterface } from '../../domain/interfaces/role.interface';

export class RoleMapper extends DomainMapper<
  RoleEntityInterface,
  RoleInterface,
  Role
> {
  createAggregate(entity: RoleEntityInterface): Role {
    const { id, version, dateCreated, dateUpdated, dateDeleted, ...props } =
      entity;

    return new Role(id, props, version, {
      dateCreated,
      dateUpdated,
      dateDeleted,
    });
  }
}
