import {
  RoleAssignmentEntityInterface,
  RoleAssignmentInterface,
} from '@concepta/nestjs-common';

import { DomainMapper } from '../../../../nestjs-common/dist/index-aggregate';
import { RoleAssignment } from '../../domain/aggregates/role-assignment';

export class RoleAssignmentMapper extends DomainMapper<
  RoleAssignmentEntityInterface,
  RoleAssignmentInterface,
  RoleAssignment
> {
  createAggregate(entity: RoleAssignmentEntityInterface): RoleAssignment {
    const { id, version, dateCreated, dateUpdated, dateDeleted, ...props } =
      entity;
    return new RoleAssignment(id, props, version, {
      dateCreated,
      dateUpdated,
      dateDeleted,
    });
  }
}
