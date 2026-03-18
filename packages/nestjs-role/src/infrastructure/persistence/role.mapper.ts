import { RoleEntityInterface, RoleInterface } from '@concepta/nestjs-common';

import { DomainMapper } from '../../../../nestjs-common/dist/index-aggregate';
import { Role } from '../../domain/aggregates/role';

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
